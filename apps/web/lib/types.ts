// Checkout
export interface CheckoutSession {
  id: string;
  amount: number;
  settle_token: string;
  settle_chain: string;
  recipient: string;
  status: string;
  expires_at: string;
}

export type CheckoutStep =
  | "loading"
  | "expired"
  | "paid"
  | "details"
  | "connecting"
  | "fund"
  | "preparing"
  | "authorizing"
  | "signing"
  | "sending"
  | "success"
  | "error";

// Dashboard
export type DashboardTab = "payments" | "keys" | "settings";

export interface MerchantSession {
  merchantId: string;
  name: string;
  email: string;
  settlementAddress: string;
  settlementToken: string;
  settlementChain: string;
  merchantToken: string;
  publishableKey: string | null;
  secretKey: string | null;
  publishableKeyPrefix: string | null;
  secretKeyPrefix: string | null;
}

export interface Payment {
  id: string;
  payer_address: string;
  settle_token: string;
  settle_chain: string;
  amount: string;
  source_breakdown: { token?: string; chain?: string } | null;
  tx_hashes: Record<string, string> | string[];
  status: string;
  settled_at: string | null;
  created_at: string;
}
