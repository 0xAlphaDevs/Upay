import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { generateApiKey, hashKey } from "@/lib/api-auth";
import { mintMerchantJWT } from "@/lib/jwt";

// POST /api/v1/setup — create a merchant account and return API keys.
// Accepts optional body: { name, email, settlement_address }
// Idempotent on email — returns fresh keys each call (old ones still valid).
export async function POST(req: NextRequest) {
  const supabase = getServiceClient();

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // body is optional
  }

  const name = (body.name as string) || "My Store";
  const email = (body.email as string) || "demo@upay.local";
  const settlementAddress =
    (body.settlement_address as string) ||
    "0x0000000000000000000000000000000000000001";

  // Upsert merchant by email (idempotent)
  const { data: existing } = await supabase
    .from("merchants")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let merchantId: string;

  if (existing) {
    merchantId = existing.id;
    await supabase
      .from("merchants")
      .update({
        name,
        settlement_address: settlementAddress,
        settlement_token: (body.settlement_token as string) || "USDC",
        settlement_chain: (body.settlement_chain as string) || "base",
      })
      .eq("id", merchantId);
  } else {
    const { data: merchant, error } = await supabase
      .from("merchants")
      .insert({
        name,
        email,
        settlement_address: settlementAddress,
        settlement_token: (body.settlement_token as string) || "USDC",
        settlement_chain: (body.settlement_chain as string) || "base",
      })
      .select("id")
      .single();

    if (error || !merchant) {
      return NextResponse.json(
        { error: "Failed to create merchant" },
        { status: 500 }
      );
    }
    merchantId = merchant.id;
  }

  // Only generate keys if the merchant has none — never rotate silently on update
  const { data: existingKeys } = await supabase
    .from("api_keys")
    .select("key_prefix, type")
    .eq("merchant_id", merchantId)
    .eq("revoked", false);

  const merchantToken = mintMerchantJWT(merchantId, email);

  if (existingKeys && existingKeys.length > 0) {
    // Merchant already has keys — return prefixes only, no new generation
    const pkPrefix = existingKeys.find((k) => k.type === "publishable")?.key_prefix ?? null;
    const skPrefix = existingKeys.find((k) => k.type === "secret")?.key_prefix ?? null;
    return NextResponse.json({
      merchant_id: merchantId,
      publishable_key: null,
      secret_key: null,
      publishable_key_prefix: pkPrefix,
      secret_key_prefix: skPrefix,
      merchant_token: merchantToken,
    });
  }

  // No valid keys exist — generate the first pair
  const publishableKey = generateApiKey("publishable");
  const secretKey = generateApiKey("secret");

  const [pkHash, skHash] = await Promise.all([
    hashKey(publishableKey),
    hashKey(secretKey),
  ]);

  await supabase.from("api_keys").insert([
    {
      merchant_id: merchantId,
      key_prefix: publishableKey, // publishable keys are safe to store in full
      key_hash: pkHash,
      type: "publishable",
      revoked: false,
    },
    {
      merchant_id: merchantId,
      key_prefix: secretKey.slice(0, 20) + "…",
      key_hash: skHash,
      type: "secret",
      revoked: false,
    },
  ]);

  return NextResponse.json({
    merchant_id: merchantId,
    publishable_key: publishableKey,
    secret_key: secretKey,
    merchant_token: merchantToken,
    note: "Copy these now — the secret key cannot be retrieved again.",
  });
}
