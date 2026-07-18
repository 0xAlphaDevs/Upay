"use client";

import { useState, useCallback } from "react";
import { C, CHAINS, TOKENS } from "@/lib/constants";
import type { MerchantSession } from "@/lib/types";

export function OnboardingForm({
  email,
  magicAddress,
  onDone,
  onSignOut,
}: {
  email: string;
  magicAddress: string;
  onDone: (session: MerchantSession) => void;
  onSignOut: () => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState(magicAddress);
  const [usingMagicWallet, setUsingMagicWallet] = useState(true);
  const [settlementToken, setSettlementToken] = useState("USDC");
  const [settlementChain, setSettlementChain] = useState("base");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddressChange = (val: string) => {
    setAddress(val);
    setUsingMagicWallet(val === magicAddress);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    if (!address.startsWith("0x") || address.length < 10) {
      setError("Enter a valid wallet address (starts with 0x)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email,
          settlement_address: address.trim(),
          settlement_token: settlementToken,
          settlement_chain: settlementChain,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Setup failed");
      onDone({
        merchantId: data.merchant_id,
        name: name.trim(),
        email,
        settlementAddress: address.trim(),
        settlementToken,
        settlementChain,
        merchantToken: data.merchant_token,
        publishableKey: data.publishable_key,
        secretKey: data.secret_key,
        publishableKeyPrefix: null,
        secretKeyPrefix: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [name, address, email, settlementToken, settlementChain, onDone]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", color: C.dark }}>Set up your account</h1>
            <button onClick={onSignOut} style={{ background: "none", border: "1px solid #E6E1EC", borderRadius: 8, padding: "8px 14px", fontWeight: 500, fontSize: 13, color: C.secondary, cursor: "pointer", flexShrink: 0 }}>
              Sign out
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: C.secondary }}>
            Signed in as <strong>{email}</strong>. Where should we send your settlements?
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: C.dark, marginBottom: 7 }}>Business name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pixel Threads"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 14, color: C.dark, background: "#fff", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: C.dark, marginBottom: 7 }}>Settlement wallet address</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                onClick={() => { setAddress(magicAddress); setUsingMagicWallet(true); }}
                style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${usingMagicWallet ? C.purple : C.border}`, background: usingMagicWallet ? C.purpleBg : "#fff", fontWeight: 600, fontSize: 12.5, color: usingMagicWallet ? C.purple : C.secondary, cursor: "pointer", transition: "all .12s" }}
              >
                ✦ Use my Magic wallet
              </button>
              <button
                type="button"
                onClick={() => { setAddress(""); setUsingMagicWallet(false); }}
                style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${!usingMagicWallet ? C.purple : C.border}`, background: !usingMagicWallet ? C.purpleBg : "#fff", fontWeight: 600, fontSize: 12.5, color: !usingMagicWallet ? C.purple : C.secondary, cursor: "pointer", transition: "all .12s" }}
              >
                Use a different address
              </button>
            </div>
            <input
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="0xYour…Address"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "var(--font-geist-mono)", color: C.dark, background: usingMagicWallet ? "#F8F6FC" : "#fff", outline: "none", boxSizing: "border-box" }}
            />
            <p style={{ margin: "6px 0 0", fontSize: 12, color: C.muted }}>
              {usingMagicWallet
                ? "Your Magic wallet — created when you signed in. You own this address."
                : "Enter any EVM address: hardware wallet, multisig, Coinbase, etc."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: C.dark, marginBottom: 7 }}>Receive as</label>
              <select
                value={settlementToken}
                onChange={(e) => setSettlementToken(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 14, color: C.dark, background: "#fff", outline: "none", cursor: "pointer", boxSizing: "border-box" }}
              >
                {TOKENS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: C.dark, marginBottom: 7 }}>On chain</label>
              <select
                value={settlementChain}
                onChange={(e) => setSettlementChain(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 14, color: C.dark, background: "#fff", outline: "none", cursor: "pointer", boxSizing: "border-box" }}
              >
                {CHAINS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div style={{ background: C.redBg, border: "1px solid #F5C6C4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !address.trim()}
            style={{ background: loading || !name.trim() || !address.trim() ? "#B9A0D5" : C.purple, color: "#fff", border: "none", borderRadius: 10, padding: "13px 20px", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 1px 2px rgba(107,63,160,.35),0 6px 16px rgba(107,63,160,.25)", transition: "background .15s" }}
          >
            {loading ? "Creating account…" : "Get API keys →"}
          </button>
        </form>
      </div>
    </div>
  );
}
