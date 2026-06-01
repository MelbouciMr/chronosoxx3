import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const CHRONOS_FEE = 0.01; // 1%

// POST /api/meter  { action: "start"|"stop"|"tick", sessionId?, userWallet, agentId }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userWallet, agentId, sessionId } = body;

    if (action === "start") {
      // 1. Get agent rate
      const { data: agent, error: agentErr } = await supabaseAdmin
        .from("agents")
        .select("id, rate_usdc_per_sec, owner_wallet, name")
        .eq("id", agentId)
        .eq("active", true)
        .single();

      if (agentErr || !agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
      }

      // 2. Check balance (at least 10 seconds worth)
      const minRequired = agent.rate_usdc_per_sec * 10;
      const { data: balance } = await supabaseAdmin
        .from("balances")
        .select("balance_usdc")
        .eq("user_wallet", userWallet)
        .eq("agent_id", agentId)
        .single();

      if (!balance || balance.balance_usdc < minRequired) {
        return NextResponse.json({
          error: "insufficient_funds",
          required: minRequired,
          current: balance?.balance_usdc ?? 0,
        }, { status: 402 }); // HTTP 402 Payment Required — x402 compatible
      }

      // 3. Create session
      const { data: session, error: sessErr } = await supabaseAdmin
        .from("sessions")
        .insert({
          user_wallet: userWallet,
          agent_id: agentId,
          status: "active",
        })
        .select()
        .single();

      if (sessErr) throw sessErr;

      return NextResponse.json({
        ok: true,
        sessionId: session.id,
        agentName: agent.name,
        ratePerSec: agent.rate_usdc_per_sec,
        balance: balance.balance_usdc,
      });
    }

    if (action === "tick") {
      // Called every N seconds to deduct balance
      const { seconds = 5 } = body;

      const { data: session } = await supabaseAdmin
        .from("sessions")
        .select("agent_id, user_wallet, status")
        .eq("id", sessionId)
        .eq("status", "active")
        .single();

      if (!session) {
        return NextResponse.json({ error: "Session not found or ended" }, { status: 404 });
      }

      const { data: agent } = await supabaseAdmin
        .from("agents")
        .select("rate_usdc_per_sec, owner_wallet")
        .eq("id", session.agent_id)
        .single();

      if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

      const cost = agent.rate_usdc_per_sec * seconds;

      // Atomic deduction
      const { data: ok } = await supabaseAdmin
        .rpc("deduct_balance", {
          p_user_wallet: session.user_wallet,
          p_agent_id: session.agent_id,
          p_amount: cost,
        });

      if (!ok) {
        // Stop session — out of funds
        await supabaseAdmin
          .from("sessions")
          .update({ status: "insufficient_funds", ended_at: new Date().toISOString() })
          .eq("id", sessionId);

        return NextResponse.json({ error: "insufficient_funds", stopped: true }, { status: 402 });
      }

      // Get updated balance
      const { data: balance } = await supabaseAdmin
        .from("balances")
        .select("balance_usdc")
        .eq("user_wallet", session.user_wallet)
        .eq("agent_id", session.agent_id)
        .single();

      return NextResponse.json({
        ok: true,
        deducted: cost,
        remaining: balance?.balance_usdc ?? 0,
      });
    }

    if (action === "stop") {
      const { data: session } = await supabaseAdmin
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

      const startedAt = new Date(session.started_at);
      const now = new Date();
      const durationSecs = (now.getTime() - startedAt.getTime()) / 1000;

      const { data: agent } = await supabaseAdmin
        .from("agents")
        .select("rate_usdc_per_sec, owner_wallet")
        .eq("id", session.agent_id)
        .single();

      const costUsdc = agent ? agent.rate_usdc_per_sec * durationSecs : 0;
      const feeUsdc = costUsdc * CHRONOS_FEE;
      const netUsdc = costUsdc - feeUsdc;

      // Update session
      await supabaseAdmin
        .from("sessions")
        .update({
          status: "ended",
          ended_at: now.toISOString(),
          duration_secs: durationSecs,
          cost_usdc: costUsdc,
        })
        .eq("id", sessionId);

      // Record earnings
      if (agent && costUsdc > 0) {
        await supabaseAdmin.from("earnings").insert({
          session_id: sessionId,
          agent_id: session.agent_id,
          owner_wallet: agent.owner_wallet,
          gross_usdc: costUsdc,
          fee_usdc: feeUsdc,
          net_usdc: netUsdc,
        });
      }

      return NextResponse.json({
        ok: true,
        durationSecs,
        costUsdc,
        netUsdc,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Meter error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/meter?sessionId=xxx — get current session status
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("sessions")
    .select("*, agents(name, rate_usdc_per_sec)")
    .eq("id", sessionId)
    .single();

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
