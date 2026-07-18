import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { mintMerchantJWT, verifyMerchantJWT } from "@/lib/jwt";

// GET /api/v1/merchant/me?email=... — look up an existing merchant by email.
// Returns merchant data + key prefixes (not the raw keys — those are hashed).
// Used by the dashboard on return visits so merchants can see their account.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id, name, email, settlement_address, settlement_token, settlement_chain")
    .eq("email", email)
    .maybeSingle();

  if (!merchant) {
    return NextResponse.json({ exists: false });
  }

  const { data: keys } = await supabase
    .from("api_keys")
    .select("key_prefix, type")
    .eq("merchant_id", merchant.id)
    .eq("revoked", false)
    .order("created_at", { ascending: false });

  const publishablePrefix = keys?.find((k) => k.type === "publishable")?.key_prefix ?? null;
  const secretPrefix = keys?.find((k) => k.type === "secret")?.key_prefix ?? null;

  const merchantToken = mintMerchantJWT(merchant.id, merchant.email);

  return NextResponse.json({
    exists: true,
    merchant_id: merchant.id,
    name: merchant.name,
    email: merchant.email,
    settlement_address: merchant.settlement_address,
    settlement_token: merchant.settlement_token,
    settlement_chain: merchant.settlement_chain,
    publishable_key_prefix: publishablePrefix,
    secret_key_prefix: secretPrefix,
    merchant_token: merchantToken,
  });
}

// PATCH /api/v1/merchant/me — update settlement preferences only. Never touches keys.
export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const claims = authHeader?.startsWith("Bearer ")
    ? verifyMerchantJWT(authHeader.slice(7).trim())
    : null;
  if (!claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("merchants")
    .update({
      settlement_token: body.settlement_token as string,
      settlement_chain: body.settlement_chain as string,
    })
    .eq("id", claims.merchantId);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
