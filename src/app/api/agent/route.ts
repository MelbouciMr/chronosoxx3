import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/agent — list all active agents
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  let query = supabaseAdmin
    .from("agents")
    .select("id, name, description, rate_usdc_per_sec, hermes_profile, owner_wallet, created_at")
    .eq("active", true)
    .order("created_at", { ascending: false });

  // Filter by owner if wallet provided
  if (wallet) {
    query = query.eq("owner_wallet", wallet.toLowerCase());
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/agent — register a new agent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ownerWallet,
      name,
      description,
      rateUsdcPerSec,
      hermesEndpoint,
      hermesProfile,
    } = body;

    if (!ownerWallet || !name) {
      return NextResponse.json({ error: "ownerWallet and name required" }, { status: 400 });
    }

    const rate = parseFloat(rateUsdcPerSec) || 0.0001;
    if (rate < 0.000001 || rate > 1) {
      return NextResponse.json({ error: "Rate must be between 0.000001 and 1 USDC/sec" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("agents")
      .insert({
        owner_wallet: ownerWallet.toLowerCase(),
        name,
        description: description || null,
        rate_usdc_per_sec: rate,
        hermes_endpoint: hermesEndpoint || null,
        hermes_profile: hermesProfile || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      agent: data,
      // SDK snippet for the developer
      snippet: generateSnippet(data.id, rate),
    });
  } catch (err) {
    console.error("Agent register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function generateSnippet(agentId: string, rate: number) {
  return `
// Chronos SDK — add to your Hermes agent startup
import { ChronosClient } from 'chronos-sdk'; // coming soon

const chronos = new ChronosClient({
  agentId: '${agentId}',
  apiUrl: '${process.env.NEXT_PUBLIC_APP_URL}/api',
});

// Start metering when agent activates
const session = await chronos.startSession(userWallet);
// session.id — keep this to stop billing later

// Stop metering when agent finishes
await chronos.stopSession(session.id);

// Rate: $${rate} USDC/sec
`.trim();
}
