import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    // Upsert — silently handle duplicates
    const { error } = await supabaseAdmin
      .from("waitlist")
      .upsert(
        { email: email.toLowerCase().trim(), role: role || null, ip },
        { onConflict: "email", ignoreDuplicates: true }
      );

    if (error) throw error;

    // Get current count
    const { count } = await supabaseAdmin
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    // Optional Slack/Discord webhook
    const webhookUrl = process.env.WAITLIST_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚀 New Chronos signup: *${email}* — ${role || "no role"}`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, position: count ?? 1 });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Admin: GET /api/waitlist?secret=xxx
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.WAITLIST_ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, count, error } = await supabaseAdmin
    .from("waitlist")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ count, entries: data });
}
