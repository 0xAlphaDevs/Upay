import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser / server-component safe client (anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Merchant-scoped client. Pass the merchant JWT from localStorage.
 * Supabase validates the JWT and RLS policies fire — the merchant can only
 * read their own rows (merchant_id claim checked in each policy).
 * Safe to use in client components.
 */
export function getMerchantClient(merchantToken: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${merchantToken}` } },
    auth: { persistSession: false },
  });
}

// Server-only admin client (service role key). Never import this in client components.
export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
