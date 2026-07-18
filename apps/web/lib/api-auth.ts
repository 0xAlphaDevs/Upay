import { getServiceClient } from "./supabase";

export async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateApiKey(type: "publishable" | "secret"): string {
  const prefix = type === "publishable" ? "pk_live_" : "sk_live_";
  const random = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}${random}`;
}

interface ValidatedKey {
  merchantId: string;
  type: "publishable" | "secret";
}

export async function validateApiKey(
  authHeader: string | null | undefined,
  requiredType?: "publishable" | "secret"
): Promise<ValidatedKey | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const key = authHeader.slice(7).trim();
  if (!key) return null;

  const hash = await hashKey(key);
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("api_keys")
    .select("merchant_id, type")
    .eq("key_hash", hash)
    .eq("revoked", false)
    .maybeSingle();

  if (error || !data) return null;
  if (requiredType && data.type !== requiredType) return null;

  return { merchantId: data.merchant_id, type: data.type as ValidatedKey["type"] };
}
