import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/hermes
// Body: { sessionId, agentId, userWallet, message }
// This proxies the message to the Hermes agent endpoint
// and handles per-message billing if rate is per-invocation

export async function POST(req: NextRequest) {
  try {
    const { sessionId, agentId, userWallet, message } = await req.json();

    if (!agentId || !userWallet || !message) {
      return NextResponse.json({ error: "agentId, userWallet, message required" }, { status: 400 });
    }

    // 1. Get agent config
    const { data: agent, error: agentErr } = await supabaseAdmin
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("active", true)
      .single();

    if (agentErr || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // 2. Verify active session (if sessionId provided) or check balance
    if (sessionId) {
      const { data: session } = await supabaseAdmin
        .from("sessions")
        .select("status")
        .eq("id", sessionId)
        .eq("user_wallet", userWallet)
        .single();

      if (!session || session.status !== "active") {
        return NextResponse.json({
          error: "No active session. Start a session first.",
          code: "NO_SESSION",
        }, { status: 402 });
      }
    }

    // 3. If agent has a Hermes endpoint, proxy the message
    if (agent.hermes_endpoint) {
      try {
        const hermesRes = await fetch(agent.hermes_endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Chronos-Session": sessionId || "",
            "X-Chronos-Wallet": userWallet,
            // Forward Hermes API key if set
            ...(process.env.HERMES_API_KEY
              ? { Authorization: `Bearer ${process.env.HERMES_API_KEY}` }
              : {}),
          },
          body: JSON.stringify({
            message,
            profile: agent.hermes_profile || "default",
          }),
        });

        if (!hermesRes.ok) {
          throw new Error(`Hermes returned ${hermesRes.status}`);
        }

        const hermesData = await hermesRes.json();

        return NextResponse.json({
          ok: true,
          response: hermesData,
          agentName: agent.name,
          ratePerSec: agent.rate_usdc_per_sec,
        });
      } catch (hermesErr) {
        console.error("Hermes proxy error:", hermesErr);
        return NextResponse.json({
          error: "Agent unreachable",
          detail: String(hermesErr),
        }, { status: 502 });
      }
    }

    // 4. No Hermes endpoint — return connection instructions
    return NextResponse.json({
      ok: false,
      code: "NO_HERMES_ENDPOINT",
      message: "This agent has no Hermes endpoint configured.",
      setup: {
        agentId: agent.id,
        instructions: [
          "1. Install Hermes Agent: curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash",
          "2. Start Hermes with API gateway: hermes --api-port 8080",
          "3. Update your agent's hermes_endpoint to your public URL",
          "4. Chronos will proxy all metered calls to your Hermes instance",
        ],
        hermesApiFormat: {
          endpoint: "https://your-vps.example.com:8080/chat",
          method: "POST",
          body: { message: "string", profile: "string" },
        },
      },
    });
  } catch (err) {
    console.error("Hermes bridge error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/hermes?agentId=xxx — check if agent's Hermes is reachable
export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId");
  if (!agentId) return NextResponse.json({ error: "agentId required" }, { status: 400 });

  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("name, hermes_endpoint, hermes_profile")
    .eq("id", agentId)
    .single();

  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  if (!agent.hermes_endpoint) {
    return NextResponse.json({ connected: false, reason: "No endpoint configured" });
  }

  // Ping the Hermes endpoint
  try {
    const ping = await fetch(agent.hermes_endpoint.replace("/chat", "/health"), {
      signal: AbortSignal.timeout(3000),
    });
    return NextResponse.json({
      connected: ping.ok,
      status: ping.status,
      agentName: agent.name,
      profile: agent.hermes_profile,
    });
  } catch {
    return NextResponse.json({ connected: false, reason: "Unreachable" });
  }
}
