import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createPublicClient, http, formatUnits } from "viem";
import { base } from "viem/chains";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
});

const TRANSFER_EVENT = {
  name: "Transfer",
  type: "event" as const,
  inputs: [
    { name: "from", type: "address" as const, indexed: true },
    { name: "to", type: "address" as const, indexed: true },
    { name: "value", type: "uint256" as const, indexed: false },
  ],
};

// POST /api/deposit  { txHash, userWallet, agentId }
export async function POST(req: NextRequest) {
  try {
    const { txHash, userWallet, agentId } = await req.json();

    if (!txHash || !userWallet || !agentId) {
      return NextResponse.json({ error: "txHash, userWallet, agentId required" }, { status: 400 });
    }

    // Prevent replay
    const { data: existing } = await supabaseAdmin
      .from("deposits")
      .select("id")
      .eq("tx_hash", txHash)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Transaction already processed" }, { status: 409 });
    }

    let amountUsdc = 0;

    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

      if (receipt.status !== "success") {
        return NextResponse.json({ error: "Transaction failed on-chain" }, { status: 400 });
      }

      const receiverWallet = process.env.CHRONOS_WALLET_ADDRESS as `0x${string}`;

      const logs = await publicClient.getLogs({
        address: USDC_ADDRESS,
        event: TRANSFER_EVENT,
        args: { from: userWallet as `0x${string}`, to: receiverWallet },
        blockHash: receipt.blockHash,
      });

      if (!logs.length) {
        return NextResponse.json({ error: "No USDC transfer to Chronos found in tx" }, { status: 400 });
      }

      const totalRaw = logs.reduce((sum, log) => sum + ((log.args as { value?: bigint }).value ?? 0n), 0n);
      amountUsdc = parseFloat(formatUnits(totalRaw, 6));
    } catch (chainErr) {
      console.error("Chain verification error:", chainErr);
      if (process.env.NODE_ENV === "development") {
        amountUsdc = parseFloat(req.nextUrl.searchParams.get("devAmount") || "0");
      } else {
        return NextResponse.json({ error: "Could not verify transaction" }, { status: 400 });
      }
    }

    if (amountUsdc <= 0) {
      return NextResponse.json({ error: "Zero amount" }, { status: 400 });
    }

    // Record deposit
    await supabaseAdmin.from("deposits").insert({
      user_wallet: userWallet.toLowerCase(),
      agent_id: agentId,
      amount_usdc: amountUsdc,
      tx_hash: txHash,
      confirmed: true,
    });

    // Upsert balance
    const { data: bal } = await supabaseAdmin
      .from("balances")
      .select("balance_usdc")
      .eq("user_wallet", userWallet.toLowerCase())
      .eq("agent_id", agentId)
      .single();

    if (bal) {
      await supabaseAdmin
        .from("balances")
        .update({ balance_usdc: bal.balance_usdc + amountUsdc, updated_at: new Date().toISOString() })
        .eq("user_wallet", userWallet.toLowerCase())
        .eq("agent_id", agentId);
    } else {
      await supabaseAdmin.from("balances").insert({
        user_wallet: userWallet.toLowerCase(),
        agent_id: agentId,
        balance_usdc: amountUsdc,
      });
    }

    return NextResponse.json({ ok: true, credited: amountUsdc, txHash });
  } catch (err) {
    console.error("Deposit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/deposit?userWallet=0x...&agentId=xxx
export async function GET(req: NextRequest) {
  const userWallet = req.nextUrl.searchParams.get("userWallet");
  const agentId = req.nextUrl.searchParams.get("agentId");

  if (!userWallet || !agentId) {
    return NextResponse.json({ error: "userWallet and agentId required" }, { status: 400 });
  }

  const { data: balance } = await supabaseAdmin
    .from("balances")
    .select("balance_usdc, updated_at")
    .eq("user_wallet", userWallet.toLowerCase())
    .eq("agent_id", agentId)
    .single();

  const { data: deposits } = await supabaseAdmin
    .from("deposits")
    .select("amount_usdc, tx_hash, created_at")
    .eq("user_wallet", userWallet.toLowerCase())
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ balance: balance?.balance_usdc ?? 0, deposits: deposits ?? [] });
}
