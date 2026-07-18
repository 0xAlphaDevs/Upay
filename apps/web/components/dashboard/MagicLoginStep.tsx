"use client";

import { useState, useCallback } from "react";
import { useMagic } from "@/components/providers";
import { C } from "@/lib/constants";
import { ULogo } from "./primitives";

export function MagicLoginStep({ onDone }: { onDone: (email: string, walletAddress: string) => void }) {
  const { magic } = useMagic();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magic || !email.trim()) return;
    setError("");
    setLoading(true);
    try {
      await magic.auth.loginWithEmailOTP({ email: email.trim() });
      const info = await magic.user.getInfo();
      onDone(info.email!, info.wallets?.ethereum?.publicAddress ?? "");
    } catch {
      setError("Login failed — check your email and try again.");
    } finally {
      setLoading(false);
    }
  }, [magic, email, onDone]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <ULogo size={32} />
          <span style={{ fontWeight: 700, fontSize: 20, color: C.dark }}>UPay</span>
        </div>

        <h1 style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", color: C.dark }}>
          Merchant dashboard
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: C.secondary }}>
          Enter your email to sign in or create an account. No password, no wallet needed.
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="you@yourstore.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{ width: "100%", padding: "13px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 15, color: C.dark, background: "#fff", outline: "none", boxSizing: "border-box" }}
          />

          {error && (
            <div style={{ background: C.redBg, border: "1px solid #F5C6C4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim() || !magic}
            style={{ background: loading || !email.trim() ? "#B9A0D5" : C.purple, color: "#fff", border: "none", borderRadius: 10, padding: "14px 20px", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 1px 2px rgba(107,63,160,.35),0 8px 20px rgba(107,63,160,.28)", transition: "background .15s" }}
          >
            {loading ? "Sending magic link…" : "Continue with email →"}
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 12, color: C.veryMuted, textAlign: "center" }}>
          Powered by Magic Labs · No wallet required
        </p>
      </div>
    </div>
  );
}
