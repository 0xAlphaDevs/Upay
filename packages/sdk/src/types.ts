export interface UPayPayment {
  id: string;
  sessionId: string;
  payerAddress: string;
  settleToken: string;
  settleChain: string;
  amount: string;
  txHashes: string[];
  settledAt: string;
}

export interface UPayCheckoutSession {
  id: string;
  checkoutUrl: string;
  amount: string;
  settleToken: string;
  settleChain: string;
  status: "pending" | "paid" | "failed" | "expired";
  expiresAt: string;
}

export interface UPayButtonProps {
  apiKey: string;
  baseUrl?: string;
  amount: string;
  token?: string;
  chain?: string;
  metadata?: Record<string, unknown>;
  onSuccess?: (payment: UPayPayment) => void;
  onError?: (err: Error) => void;
  label?: string;
  className?: string;
}

export interface UPayClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface CreateCheckoutOptions {
  amount: string;
  token?: string;
  chain?: string;
  metadata?: Record<string, unknown>;
  successUrl?: string;
  cancelUrl?: string;
}
