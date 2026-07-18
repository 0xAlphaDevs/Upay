"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { isAddress } from "viem";
import { C, CHAINS, TOKENS } from "@/lib/constants";
import { createUA, signAndSendWithMagic, type UAPhase } from "@/lib/ua";
import { getTokenAddress, getChainId } from "@/lib/chains";
import { useMagic } from "@/components/providers";
import type { MerchantSession } from "@/lib/types";

const TOKEN_ICON: Record<string, string> = {
  USDC: "/assets/usdc.svg",
  USDT: "/assets/usdt.svg",
  ETH:  "/assets/eth.svg",
};

const CHAIN_ICON: Record<string, string> = {
  base:     "/assets/base.svg",
  ethereum: "/assets/eth.svg",
  arbitrum: "/assets/arbitrum.svg",
  polygon:  "/assets/polygon.svg",
};

function PillSelector<T extends string>({
  options,
  value,
  onChange,
  getIcon,
  getLabel,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  getIcon: (v: T) => string;
  getLabel: (v: T) => string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "8px 13px",
              borderRadius: 999,
              border: active ? `1.5px solid ${C.purple}` : `1.5px solid ${C.border}`,
              background: active ? C.purpleBg : "#fff",
              color: active ? C.purple : C.dark,
              fontWeight: active ? 600 : 500,
              fontSize: 13.5,
              cursor: "pointer",
              transition: "all .12s",
              boxShadow: active ? `0 0 0 3px ${C.purpleBorder}` : "none",
            }}
          >
            <Image src={getIcon(opt)} alt={getLabel(opt)} width={18} height={18} style={{ borderRadius: "50%" }} />
            {getLabel(opt)}
          </button>
        );
      })}
    </div>
  );
}

function WithdrawCard({ session }: { session: MerchantSession }) {
  const { magic } = useMagic();
  const [magicAddress, setMagicAddress] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [dest, setDest] = useState("");
  const [amount, setAmount] = useState("");
  const [phase, setPhase] = useState<UAPhase | "preparing" | null>(null);
  const [txId, setTxId] = useState("");
  const [error, setError] = useState("");

  const refreshBalance = useCallback(async (owner: string) => {
    setBalanceLoading(true);
    try {
      const assets = await createUA(owner).getPrimaryAssets();
      setBalance(Number(assets.totalAmountInUSD) || 0);
    } catch {
      // leave previous balance
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!magic) return;
    magic.user.getInfo().then((info) => {
      const addr = info.wallets?.ethereum?.publicAddress;
      if (addr) {
        setMagicAddress(addr);
        refreshBalance(addr);
      }
    }).catch(() => {});
  }, [magic, refreshBalance]);

  const externalSettlement =
    magicAddress && session.settlementAddress &&
    magicAddress.toLowerCase() !== session.settlementAddress.toLowerCase();

  const amountNum = parseFloat(amount);
  const canWithdraw =
    !!magic && !!magicAddress && phase === null &&
    isAddress(dest) && !Number.isNaN(amountNum) && amountNum > 0 &&
    balance !== null && amountNum <= balance;

  const handleWithdraw = useCallback(async () => {
    if (!magic || !canWithdraw) return;
    setError("");
    setTxId("");
    setPhase("preparing");
    try {
      const ua = createUA(magicAddress);
      const transaction = await ua.createTransferTransaction({
        token: {
          chainId: getChainId(session.settlementChain),
          address: getTokenAddress(session.settlementChain, session.settlementToken),
        },
        amount: amountNum.toString(),
        receiver: dest,
      });
      const result = await signAndSendWithMagic({
        magic,
        ua,
        transaction,
        ownerAddress: magicAddress,
        onPhase: setPhase,
      });
      setTxId(result?.transactionId ?? "");
      setAmount("");
      refreshBalance(magicAddress);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Withdrawal failed");
    } finally {
      setPhase(null);
    }
  }, [magic, canWithdraw, magicAddress, amountNum, dest, session.settlementChain, session.settlementToken, refreshBalance]);

  const phaseLabel: Record<string, string> = {
    preparing: "Preparing…",
    authorizing: "Authorizing (first time only)…",
    signing: "Signing…",
    sending: "Sending…",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "#F8F6FC", border: "1px solid #EEE9F6", borderRadius: 9,
    padding: "11px 13px", fontFamily: "var(--font-geist-mono)", fontWeight: 500,
    fontSize: 13, color: C.dark, outline: "none",
  };

  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: C.dark }}>Wallet balance</div>
        <button
          onClick={() => magicAddress && refreshBalance(magicAddress)}
          disabled={balanceLoading || !magicAddress}
          style={{ background: "none", border: "none", cursor: balanceLoading ? "default" : "pointer", fontWeight: 500, fontSize: 12, color: C.secondary, padding: 0 }}
        >
          {balanceLoading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>
      <div style={{ fontWeight: 700, fontSize: 28, color: C.dark, letterSpacing: "-.02em", marginBottom: 2 }}>
        {balance !== null ? `$${balance.toFixed(2)}` : "—"}
      </div>
      <div style={{ fontWeight: 400, fontSize: 12, color: C.secondary, marginBottom: 14 }}>
        Spendable across all chains · withdraws as {session.settlementToken} on{" "}
        {CHAINS.find(c => c.value === session.settlementChain)?.label ?? session.settlementChain}
      </div>

      {externalSettlement ? (
        <div style={{ background: "#FFF8E7", border: "1px solid #F0E1B8", borderRadius: 9, padding: "10px 13px", fontSize: 12.5, color: "#8A6D1A" }}>
          Your settlement address isn&apos;t your UPay (Magic) wallet, so withdrawals aren&apos;t available here —
          funds already settle directly to your own address.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={dest}
            onChange={(e) => setDest(e.target.value.trim())}
            placeholder="Destination address (0x…)"
            spellCheck={false}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Amount (${session.settlementToken})`}
              inputMode="decimal"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={() => balance !== null && setAmount(Math.max(balance - 0.05, 0).toFixed(2))}
              disabled={balance === null || balance <= 0}
              style={{ background: "#F8F6FC", border: "1px solid #EEE9F6", borderRadius: 9, padding: "0 14px", fontWeight: 600, fontSize: 12.5, color: C.purple, cursor: "pointer" }}
            >
              Max
            </button>
          </div>

          {error && (
            <div style={{ background: C.redBg, border: "1px solid #F5C6C4", borderRadius: 8, padding: "9px 13px", fontSize: 12.5, color: C.red, wordBreak: "break-word" }}>{error}</div>
          )}
          {txId && (
            <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 8, padding: "9px 13px", fontSize: 12.5, color: C.greenDark }}>
              Withdrawal sent ✓{" "}
              <a href={`https://universalx.app/activity/details?id=${txId}`} target="_blank" rel="noopener noreferrer" style={{ color: C.greenDark, fontWeight: 600 }}>
                View transaction ↗
              </a>
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={!canWithdraw}
            style={{ background: canWithdraw ? C.purple : "#B9A0D5", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14, cursor: canWithdraw ? "pointer" : "not-allowed", transition: "background .15s" }}
          >
            {phase ? phaseLabel[phase] : "Withdraw"}
          </button>
          <div style={{ fontWeight: 400, fontSize: 11.5, color: C.veryMuted, textAlign: "center" }}>
            Gasless — network fees are handled by UPay&apos;s relayer.
          </div>
        </div>
      )}
    </div>
  );
}

export function SettingsTab({ session, onSave }: { session: MerchantSession; onSave: (token: string, chain: string) => void }) {
  const [token, setToken] = useState(session.settlementToken);
  const [chain, setChain] = useState(session.settlementChain);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const selectedChain = CHAINS.find(c => c.value === chain);
  const dirty = token !== session.settlementToken || chain !== session.settlementChain;

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/v1/merchant/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.merchantToken}`,
        },
        body: JSON.stringify({ settlement_token: token, settlement_chain: chain }),
      });
      if (!res.ok) throw new Error("Save failed");
      onSave(token, chain);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }, [token, chain, session.merchantToken, onSave]);

  return (
    <>
      <h1 style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", color: C.dark }}>Settlement settings</h1>
      <p style={{ margin: "0 0 22px", fontSize: 14, color: C.secondary }}>Choose exactly what you receive regardless of what the customer pays with.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>

        {/* LEFT — settlement config + info cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>Settlement address</label>
            <div style={{ marginTop: 8, background: "#F8F6FC", border: "1px solid #EEE9F6", borderRadius: 9, padding: "12px 14px", fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 13.5, color: C.purpleHover, wordBreak: "break-all" }}>
              {session.settlementAddress}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: C.dark, marginBottom: 10 }}>Receive as</label>
            <PillSelector
              options={TOKENS as unknown as string[]}
              value={token}
              onChange={setToken}
              getIcon={(t) => TOKEN_ICON[t] ?? "/assets/usdc.svg"}
              getLabel={(t) => t}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: C.dark, marginBottom: 10 }}>On chain</label>
            <PillSelector
              options={CHAINS.map(c => c.value)}
              value={chain}
              onChange={setChain}
              getIcon={(v) => CHAIN_ICON[v] ?? "/assets/base.svg"}
              getLabel={(v) => CHAINS.find(c => c.value === v)?.label ?? v}
            />
          </div>

          {/* Summary row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F8F6FC", border: "1px solid #EEE9F6", borderRadius: 9, padding: "12px 14px", fontWeight: 500, fontSize: 13.5, color: C.dark }}>
            You receive&nbsp;
            <Image src={TOKEN_ICON[token] ?? "/assets/usdc.svg"} alt={token} width={18} height={18} style={{ borderRadius: "50%" }} />
            <strong>{token}</strong>
            &nbsp;on&nbsp;
            <Image src={CHAIN_ICON[chain] ?? "/assets/base.svg"} alt={chain} width={18} height={18} style={{ borderRadius: "50%" }} />
            <strong>{selectedChain?.label ?? chain}</strong>
          </div>

          {error && (
            <div style={{ background: C.redBg, border: "1px solid #F5C6C4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red }}>{error}</div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            style={{ background: saving || !dirty ? "#B9A0D5" : C.purple, color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontWeight: 600, fontSize: 14, cursor: saving || !dirty ? "not-allowed" : "pointer", transition: "background .15s" }}
          >
            {saved ? "Saved ✓" : saving ? "Saving…" : "Save changes"}
          </button>
        </div>

          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.dark, marginBottom: 10 }}>How settlements work</div>
            {[
              { icon: "⚡", title: "Any token in", body: "Customers pay with whatever they hold — USDC, ETH, USDT, or any supported token on any chain." },
              { icon: "🔄", title: "Automatic swap", body: "UPay's chain abstraction converts the payment to your preferred token in the same transaction." },
              { icon: "🏦", title: "Your token out", body: "Your settlement address receives exactly what you configured — no manual bridging needed." },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #F4F2F7" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.dark }}>{title}</div>
                  <div style={{ fontWeight: 400, fontSize: 12.5, color: C.secondary, marginTop: 3 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.purple, marginBottom: 5 }}>UPay fee</div>
            <div style={{ fontWeight: 700, fontSize: 28, color: C.dark, letterSpacing: "-.02em" }}>0.25%</div>
            <div style={{ fontWeight: 400, fontSize: 12.5, color: C.secondary, marginTop: 4 }}>Per transaction — no monthly fees, no setup costs. You keep 99.75% of every payment.</div>
          </div>
        </div>

        {/* RIGHT — balance & withdraw */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <WithdrawCard session={session} />
        </div>
      </div>
    </>
  );
}
