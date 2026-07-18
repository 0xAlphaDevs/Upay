import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { validateApiKey } from "@/lib/api-auth";

// POST /api/v1/sessions — create a checkout session (auth: secret key)
export async function POST(req: NextRequest) {
  // Both publishable (client-side SDK) and secret (server-side) keys can create sessions
  const auth = await validateApiKey(req.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { amount, token, chain, recipient, metadata, success_url, cancel_url } = body as {
    amount?: string;
    token?: string;
    chain?: string;
    recipient?: string;
    metadata?: Record<string, unknown>;
    success_url?: string;
    cancel_url?: string;
  };

  if (!amount) {
    return NextResponse.json(
      { error: "amount is required" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  // Fall back to merchant's settlement config if not provided
  const { data: merchant, error: merchantErr } = await supabase
    .from("merchants")
    .select("settlement_address, settlement_token, settlement_chain")
    .eq("id", auth.merchantId)
    .single();

  if (merchantErr || !merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  const settleRecipient = (recipient as string) ?? merchant.settlement_address;
  const settleToken = (token as string) ?? merchant.settlement_token;
  const settleChain = (chain as string) ?? merchant.settlement_chain;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { data: session, error: sessionErr } = await supabase
    .from("checkout_sessions")
    .insert({
      merchant_id: auth.merchantId,
      amount: parseFloat(amount as string),
      settle_token: settleToken,
      settle_chain: settleChain,
      recipient: settleRecipient,
      status: "pending",
      metadata: (metadata ?? null) as import("@/lib/database.types").Json | null,
      success_url: (success_url as string) ?? null,
      cancel_url: (cancel_url as string) ?? null,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (sessionErr || !session) {
    console.error("Session insert error:", sessionErr);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return NextResponse.json({
    id: session.id,
    checkout_url: `${appUrl}/checkout/${session.id}`,
    amount,
    settle_token: settleToken,
    settle_chain: settleChain,
    status: "pending",
    expires_at: expiresAt,
  });
}
