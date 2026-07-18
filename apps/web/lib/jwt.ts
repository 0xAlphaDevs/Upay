import crypto from "crypto";

function b64url(data: string | Buffer): string {
  return Buffer.from(data).toString("base64url");
}

/**
 * Mint a Supabase-compatible JWT for a merchant.
 * Signed with SUPABASE_JWT_SECRET — Supabase accepts these as authenticated
 * sessions and RLS policies can read claims via auth.jwt() ->> 'merchant_id'.
 */
export function mintMerchantJWT(merchantId: string, email: string): string {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) throw new Error("SUPABASE_JWT_SECRET is not set");

  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(
    JSON.stringify({
      sub: merchantId,
      role: "authenticated",   // required for Supabase RLS to activate
      merchant_id: merchantId, // custom claim — used in RLS policies
      email,
      iat: now,
      exp: now + 30 * 24 * 60 * 60, // 30 days
    })
  );

  const sig = b64url(
    crypto
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest()
  );

  return `${header}.${payload}.${sig}`;
}

/**
 * Verify a merchant JWT. Returns the payload or null if invalid/expired.
 */
export function verifyMerchantJWT(
  token: string
): { merchantId: string; email: string } | null {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) return null;

  try {
    const [header, payload, sig] = token.split(".");
    if (!header || !payload || !sig) return null;

    const expected = b64url(
      crypto
        .createHmac("sha256", secret)
        .update(`${header}.${payload}`)
        .digest()
    );

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }

    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (claims.exp < Math.floor(Date.now() / 1000)) return null;

    return { merchantId: claims.merchant_id, email: claims.email };
  } catch {
    return null;
  }
}
