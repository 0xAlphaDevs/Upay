"use client";

import { useEffect, useState, useCallback } from "react";
import { createUA, signAndSendWithMagic } from "@/lib/ua";
import {
  ShieldCheck, X, Mail, ArrowRight, Plus,
  ExternalLink, Copy, Check, AlertCircle, Loader2,
} from "lucide-react";
import { useMagic } from "@/components/providers";
import { truncateAddress, formatAmount } from "@/lib/utils";
import { getTokenAddress, getChainId, getExplorerUrl, chainLabel } from "@/lib/chains";
import type { CheckoutSession, CheckoutStep as Step } from "@/lib/types";

export function CheckoutClient({ sessionId }: { sessionId: string }) {
  const { magic } = useMagic();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState<string | null>(null);
  const [txHashes, setTxHashes] = useState<string[]>([]);
  const [payerAddress, setPayerAddress] = useState<string>("");
  const [payerEmail, setPayerEmail] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [feeEstimate, setFeeEstimate] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  // Fetch session on mount
  useEffect(() => {
    fetch(`/api/v1/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSession(data);
        if (data.status === "expired") return setStep("expired");
        if (data.status === "paid") return setStep("paid");
        setStep("details");
      })
      .catch((e: Error) => {
        setError(e.message);
        setStep("error");
      });
  }, [sessionId]);

  const closeModal = useCallback(() => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "upay:close" }, "*");
    }
  }, []);

  // Restore an existing Magic session (customer paid before in this browser)
  useEffect(() => {
    if (!magic) return;
    magic.user.isLoggedIn().then(async (loggedIn) => {
      if (!loggedIn) return;
      const info = await magic.user.getInfo();
      const address = info.wallets?.ethereum?.publicAddress;
      if (address) {
        setPayerAddress(address);
        setPayerEmail(info.email ?? "");
      }
    }).catch(() => { });
  }, [magic]);

  const connectWallet = useCallback(async () => {
    if (!magic) {
      setError("Wallet service not ready. Please try again in a moment.");
      setStep("error");
      return;
    }
    const email = emailInput.trim();
    if (!email) return;
    setStep("connecting");
    try {
      await magic.auth.loginWithEmailOTP({ email });
      const info = await magic.user.getInfo();
      setPayerAddress(info.wallets?.ethereum?.publicAddress ?? "");
      setPayerEmail(info.email ?? email);
      setStep("details");
    } catch {
      setStep("details");
    }
  }, [magic, emailInput]);

  const switchAccount = useCallback(async () => {
    if (!magic) return;
    await magic.user.logout().catch(() => { });
    setPayerAddress("");
    setPayerEmail("");
    setBalance(null);
  }, [magic]);

  const refreshBalance = useCallback(async (owner: string): Promise<number | null> => {
    setBalanceLoading(true);
    try {
      const assets = await createUA(owner).getPrimaryAssets();
      const total = Number(assets.totalAmountInUSD) || 0;
      setBalance(total);
      return total;
    } catch {
      return null;
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // Fetch spendable balance once the customer is signed in
  useEffect(() => {
    if (payerAddress) refreshBalance(payerAddress);
  }, [payerAddress, refreshBalance]);

  const handlePay = useCallback(async () => {
    if (!session || !payerAddress) return;
    if (!magic) {
      setError("Wallet service not ready.");
      setStep("error");
      return;
    }

    // Not enough in the Universal Account → show funding screen instead of a cryptic failure
    if (balance !== null && balance < session.amount) {
      setStep("fund");
      return;
    }

    try {
      setStep("preparing");

      const ua = createUA(payerAddress);

      const tokenAddress = getTokenAddress(session.settle_chain, session.settle_token);
      const chainId = getChainId(session.settle_chain);

      const transaction = await ua.createTransferTransaction({
        token: {
          chainId,
          address: tokenAddress,
        },
        amount: session.amount.toString(),
        receiver: session.recipient,
      });

      const fees = transaction.transactionFees;
      if (fees) {
        const total = Number(fees.transactionServiceFeeAmountInUSD) + Number(fees.transactionLPFeeAmountInUSD);
        if (total > 0) setFeeEstimate(`~$${total.toFixed(2)}`);
        else if (fees.freeGasFee && fees.freeServiceFee) setFeeEstimate("Free");
      }

      const result = await signAndSendWithMagic({
        magic,
        ua,
        transaction,
        ownerAddress: payerAddress,
        onPhase: setStep,
      });

      const hashes: string[] = [];
      if (result.transactionId) hashes.push(result.transactionId);

      // Record the payment. The server verifies with Particle (polling until the
      // bundle settles) and returns the payment row incl. real per-chain tx hashes.
      let recorded = false;
      for (let attempt = 0; attempt < 3 && !recorded; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 3000));
        try {
          const res = await fetch(`/api/v1/sessions/${sessionId}/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payer_address: payerAddress,
              tx_hashes: hashes,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            recorded = true;
            const recordedHashes = data?.payment?.tx_hashes;
            if (Array.isArray(recordedHashes) && recordedHashes.length) {
              hashes.splice(0, hashes.length, ...recordedHashes);
            }
          } else {
            console.error("complete failed:", data?.error);
          }
        } catch (err) {
          console.error("complete request error:", err);
        }
      }

      setTxHashes(hashes);
      setStep("success");

      if (window.parent !== window) {
        window.parent.postMessage(
          { type: "upay:success", payment: { txHashes: hashes, payerAddress } },
          "*"
        );
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Payment failed";
      // Particle throws when the UA can't cover amount + fees — send to funding, not a dead end
      if (/insufficient|not enough|balance/i.test(msg)) {
        refreshBalance(payerAddress);
        setStep("fund");
        return;
      }
      setError(msg);
      setStep("error");
    }
  }, [session, payerAddress, sessionId, magic, balance, refreshBalance]);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Clipboard API is blocked (e.g. embedded in an iframe without
      // clipboard-write permission) — fall back to the legacy method.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }, []);

  const copyAddress = useCallback(async () => {
    if (!payerAddress) return;
    const ok = await copyToClipboard(payerAddress);
    if (!ok) return;
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  }, [payerAddress, copyToClipboard]);

  const copyTx = useCallback(async () => {
    const hash = txHashes.find((h) => h.length === 66) ?? txHashes[0];
    if (!hash) return;
    const ok = await copyToClipboard(hash);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [txHashes, copyToClipboard]);

  // ── Layouts ────────────────────────────────────────────────────────────────

  if (step === "loading") return <Shell><Spinner label="Loading checkout…" /></Shell>;

  if (step === "expired") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="font-semibold">Checkout expired</p>
          <p className="text-sm text-muted-foreground">Return to the store to start a new checkout.</p>
        </div>
      </Shell>
    );
  }

  if (step === "paid") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <ShieldCheck className="h-10 w-10 text-green-500" aria-hidden="true" />
          <p className="font-semibold">Already paid</p>
          <p className="text-sm text-muted-foreground">This checkout was already completed.</p>
          <CloseButton onClick={closeModal} />
        </div>
      </Shell>
    );
  }

  if (step === "success") {
    // Prefer a real per-chain tx hash (66 chars) for the explorer link; the
    // Particle transactionId is shorter and only resolves on UniversalX.
    const chainHash = txHashes.find((h) => h.length === 66);
    const displayHash = chainHash ?? txHashes[0];
    const explorerHref = chainHash
      ? getExplorerUrl(session?.settle_chain ?? "base", chainHash)
      : `https://universalx.app/activity/details?id=${txHashes[0] ?? ""}`;
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-4 text-center animate-fade-in">
          <div className="rounded-full bg-green-50 p-3">
            <ShieldCheck className="h-8 w-8 text-green-500" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold text-lg">Payment complete</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatAmount(session?.amount ?? 0, session?.settle_token ?? "")} settled on{" "}
              {chainLabel(session?.settle_chain ?? "")}
            </p>
          </div>

          <div className="w-full rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-left text-sm">
            <Row label="From" value={truncateAddress(payerAddress)} />
            <Row label="To" value={truncateAddress(session?.recipient ?? "")} />
            <Row label="Amount" value={formatAmount(session?.amount ?? 0, session?.settle_token ?? "")} />
            <Row label="Chain" value={chainLabel(session?.settle_chain ?? "")} />
            {displayHash && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tx</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs">{truncateAddress(displayHash, 6)}</span>
                  <button onClick={copyTx} aria-label="Copy transaction hash"
                    className="rounded p-0.5 hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none">
                    {copied
                      ? <Check className="h-3.5 w-3.5 text-green-500" />
                      : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                  </button>
                  <a href={explorerHref}
                    target="_blank" rel="noopener noreferrer"
                    aria-label="View on explorer"
                    className="rounded p-0.5 hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <button onClick={closeModal}
            className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring outline-none min-h-[44px]">
            Done
          </button>
        </div>
      </Shell>
    );
  }

  if (step === "fund") {
    const short = session !== null && balance !== null && balance < session.amount;
    const needed = session ? Math.max(session.amount - (balance ?? 0), session.amount * 0.05) : 0;
    return (
      <Shell>
        <div className="flex flex-col gap-4 py-2">
          <div className="text-center">
            <div className={`mx-auto mb-3 w-fit rounded-full p-3 ${short ? "bg-amber-50" : "bg-indigo-50"}`}>
              {short
                ? <AlertCircle className="h-8 w-8 text-amber-500" aria-hidden="true" />
                : <Plus className="h-8 w-8 text-indigo-500" aria-hidden="true" />}
            </div>
            <p className="font-semibold">{short ? "Add funds to pay" : "Fund your wallet"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {short ? (
                <>
                  Your balance is {balance !== null ? `$${balance.toFixed(2)}` : "—"} but this payment needs{" "}
                  {session ? formatAmount(session.amount, session.settle_token) : "—"}
                  {" "}(plus a small network fee).
                </>
              ) : (
                <>Current balance: {balance !== null ? `$${balance.toFixed(2)}` : "—"}</>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Send crypto to your UPay wallet
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs break-all">{payerAddress}</span>
              <button onClick={copyAddress} aria-label="Copy wallet address"
                className="shrink-0 rounded p-1 hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none">
                {addressCopied
                  ? <Check className="h-4 w-4 text-green-500" />
                  : <Copy className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              USDC, USDT or ETH on Base, Arbitrum, Polygon or Ethereum{short ? ` — about $${needed.toFixed(2)} more` : ""}.
              No gas needed; fees are handled for you.
            </p>
          </div>

          <button
            onClick={async () => {
              const total = await refreshBalance(payerAddress);
              if (session && total !== null && total >= session.amount) setStep("details");
            }}
            disabled={balanceLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white py-3 text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring outline-none min-h-[44px] disabled:opacity-60"
          >
            {balanceLoading
              ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              : null}
            {balanceLoading ? "Checking balance…" : "I've sent it — check again"}
          </button>
          <button
            onClick={() => setStep("details")}
            className="w-full rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none min-h-[44px]"
          >
            Back
          </button>
        </div>
      </Shell>
    );
  }

  if (step === "error") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="rounded-full bg-red-50 p-3">
            <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
          </div>
          <div>
            <p className="font-semibold">Payment failed</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">{error}</p>
          </div>
          <div className="flex gap-2 w-full">
            <button onClick={() => { setStep("details"); setError(null); }}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none min-h-[44px]">
              Try again
            </button>
            <button onClick={closeModal}
              className="flex-1 rounded-lg bg-destructive text-destructive-foreground py-2.5 text-sm font-medium hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring outline-none min-h-[44px]">
              Cancel
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  const isProcessing = ["connecting", "preparing", "authorizing", "signing", "sending"].includes(step);
  const stepLabel: Record<string, string> = {
    connecting: "Check your email for the login code…",
    preparing: "Building transaction…",
    authorizing: "Setting up your account (first time only)…",
    signing: "Authorizing payment…",
    sending: "Sending…",
  };

  return (
    <Shell>
      {/* Amount */}
      <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">You pay</p>
        <p className="text-4xl font-bold tracking-tight">
          {session ? formatAmount(session.amount, session.settle_token) : "—"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Settled on {chainLabel(session?.settle_chain ?? "")}
        </p>
        {feeEstimate && (
          <p className="text-xs text-muted-foreground mt-0.5">Est. fee: {feeEstimate}</p>
        )}
      </div>

      {/* Trust signals */}
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <TrustRow text="Pay from any chain, any token, no bridging" />
        <TrustRow text="Non-custodial, funds go wallet-to-wallet" />
        <TrustRow text="Powered by Particle Universal Accounts" />
      </div>

      {/* Action */}
      {isProcessing ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <Loader2 className="h-6 w-6 animate-spin text-upay-purple" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{stepLabel[step]}</p>
        </div>
      ) : !payerAddress ? (
        <form
          onSubmit={(e) => { e.preventDefault(); connectWallet(); }}
          className="space-y-2.5"
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white py-3 text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring outline-none min-h-[44px]"
          >
            Continue with email
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="text-center text-[11px] text-muted-foreground/70">
            No wallet extension needed — a one-time code is sent to your email.
          </p>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium">{payerEmail || "Signed in"}</div>
              <div className="font-mono text-[11px] text-muted-foreground">{truncateAddress(payerAddress)}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {balanceLoading ? "…" : balance !== null ? `$${balance.toFixed(2)}` : ""}
              </span>
              <button
                onClick={switchAccount}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
              >
                Switch
              </button>
            </div>
          </div>
          <button
            onClick={handlePay}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white py-3 text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring outline-none min-h-[44px]"
          >
            Pay now
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => setStep("fund")}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none min-h-[44px]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Fund wallet
          </button>
        </div>
      )}

      <p className="text-center text-[11px] text-muted-foreground/60">
        Secured by UPay · Non-custodial
      </p>
    </Shell>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  const closeModal = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "upay:close" }, "*");
    }
  };

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const sendHeight = () => {
      const h = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "upay:height", height: h }, "*");
    };
    sendHeight();
    const ro = new ResizeObserver(sendHeight);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
          <span className="text-sm font-semibold">UPay Checkout</span>
        </div>
        <button onClick={closeModal} aria-label="Close checkout"
          className="rounded-lg p-1.5 hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <Loader2 className="h-7 w-7 animate-spin text-upay-purple" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function TrustRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <ShieldCheck className="h-4 w-4 text-upay-purple mt-0.5 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
      Close
    </button>
  );
}
