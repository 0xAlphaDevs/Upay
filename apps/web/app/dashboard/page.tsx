"use client";

import Link from "next/link";
import Image from "next/image";

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
import { useState, useEffect, useCallback } from "react";
import { useMagic } from "@/components/providers";
import { C, CHAINS } from "@/lib/constants";
import type { DashboardTab as Tab, MerchantSession, Payment } from "@/lib/types";
import { ULogo, SignOutButton } from "@/components/dashboard/primitives";
import { MagicLoginStep } from "@/components/dashboard/MagicLoginStep";
import { OnboardingForm } from "@/components/dashboard/OnboardingForm";
import { KeysView } from "@/components/dashboard/KeysView";
import { PaymentsTab } from "@/components/dashboard/PaymentsTab";
import { ReceiptDetail } from "@/components/dashboard/ReceiptDetail";
import { SettingsTab } from "@/components/dashboard/SettingsTab";

export default function DashboardPage() {
  const { magic } = useMagic();
  const [tab, setTab] = useState<Tab>("keys");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [session, setSession] = useState<MerchantSession | null>(null);
  const [authState, setAuthState] = useState<null | "unauthenticated" | { email: string; walletAddress: string }>(null);
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");

  // Check existing Magic session on mount
  useEffect(() => {
    if (!magic) return;
    magic.user.isLoggedIn().then(async (loggedIn) => {
      if (!loggedIn) { setAuthState("unauthenticated"); return; }
      const info = await magic.user.getInfo();
      setAuthState({ email: info.email!, walletAddress: info.wallets?.ethereum?.publicAddress ?? "" });
    });
  }, [magic]);

  // When authenticated, look up existing merchant record
  useEffect(() => {
    if (!authState || authState === "unauthenticated") return;
    setMerchantLoading(true);
    fetch(`/api/v1/merchant/me?email=${encodeURIComponent(authState.email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.exists) {
          setSession({
            merchantId: data.merchant_id,
            name: data.name,
            email: data.email,
            settlementAddress: data.settlement_address,
            settlementToken: data.settlement_token ?? "USDC",
            settlementChain: data.settlement_chain ?? "base",
            merchantToken: data.merchant_token,
            publishableKey: null,
            secretKey: null,
            publishableKeyPrefix: data.publishable_key_prefix,
            secretKeyPrefix: data.secret_key_prefix,
          });
        }
      })
      .finally(() => setMerchantLoading(false));
  }, [authState]);

  // Fetch payments when the tab is opened and we have a session
  useEffect(() => {
    if (tab !== "payments" || !session?.merchantToken) return;
    setPaymentsLoading(true);
    setPaymentsError("");
    fetch("/api/v1/payments", {
      headers: { Authorization: `Bearer ${session.merchantToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPayments(data.payments ?? []);
      })
      .catch(() => setPaymentsError("Failed to load payments."))
      .finally(() => setPaymentsLoading(false));
  }, [tab, session?.merchantToken]);

  const handleSignOut = useCallback(async () => {
    if (!magic) return;
    await magic.user.logout();
    setAuthState("unauthenticated");
    setSession(null);
  }, [magic]);

  // ── Auth gates ────────────────────────────────────────────────────────────────

  if (authState === null || merchantLoading) {
    return <div style={{ minHeight: "100vh", background: C.bg }} />;
  }

  if (authState === "unauthenticated") {
    return <MagicLoginStep onDone={(email, walletAddress) => setAuthState({ email, walletAddress })} />;
  }

  if (!session) {
    return (
      <OnboardingForm
        email={authState.email}
        magicAddress={authState.walletAddress}
        onDone={setSession}
        onSignOut={handleSignOut}
      />
    );
  }

  // ── Full dashboard ────────────────────────────────────────────────────────────

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: "keys",     label: "API keys",  icon: "🔑" },
    { id: "payments", label: "Payments",  icon: "💳" },
    { id: "settings", label: "Settings",  icon: "⚙" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", fontFamily: "var(--font-geist-sans), system-ui, sans-serif", color: C.ink }}>

      {/* SIDEBAR */}
      <div style={{ background: "#fff", borderRight: `1px solid ${C.border}`, padding: "20px 14px", display: "flex", flexDirection: "column" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", marginBottom: 22, textDecoration: "none" }}>
          <ULogo size={28} />
          <span style={{ fontWeight: 600, fontSize: 16, color: C.ink }}>UPay</span>
        </Link>

        <div style={{ fontWeight: 600, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#B3ADBC", padding: "0 10px", marginBottom: 8 }}>Merchant</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ id, label, icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => { setTab(id); setSelectedPayment(null); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, fontWeight: 500, fontSize: 14, color: active ? C.purple : C.secondary, background: active ? C.purpleBg : "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background .1s" }}
              >
                <span>{icon}</span> {label}
              </button>
            );
          })}
        </div>

        <div style={{ fontWeight: 600, fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: "#B3ADBC", padding: "0 10px", margin: "20px 0 8px" }}>Coming soon</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {["Invoices", "Analytics", "Off-ramps", "Webhooks"].map(label => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 10px", borderRadius: 9, fontWeight: 500, fontSize: 14, color: "#B3ADBC" }}>
              {label}
              <span style={{ fontWeight: 600, fontSize: 9.5, letterSpacing: ".04em", textTransform: "uppercase", color: "#9A7FC0", background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, padding: "2px 6px", borderRadius: 5 }}>Soon</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto" }}>
          <Link href="/" style={{ display: "block", padding: "9px 10px", borderRadius: 9, fontWeight: 500, fontSize: 13.5, color: C.secondary, textDecoration: "none" }}>
            ← Back to site
          </Link>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ background: C.bg, minWidth: 0 }}>
        <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: C.dark }}>{session.name}</span>
            <span style={{ fontWeight: 500, fontSize: 11.5, color: C.greenDark, background: C.greenBg, border: `1px solid ${C.greenBorder}`, padding: "3px 9px", borderRadius: 6 }}>● Live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 500, fontSize: 11, color: C.veryMuted }}>Settlement</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-geist-mono)", fontWeight: 600, fontSize: 13, color: C.dark }}>
                <Image src={TOKEN_ICON[session.settlementToken] ?? "/assets/usdc.svg"} alt={session.settlementToken} width={16} height={16} style={{ borderRadius: "50%" }} />
                {session.settlementToken}
                <span style={{ color: C.veryMuted }}>·</span>
                <Image src={CHAIN_ICON[session.settlementChain] ?? "/assets/base.svg"} alt={session.settlementChain} width={16} height={16} style={{ borderRadius: "50%" }} />
                {CHAINS.find(c => c.value === session.settlementChain)?.label ?? session.settlementChain}
              </div>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(145deg,#8454C6,#6B3FA0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{session.name[0]?.toUpperCase()}</span>
            </div>
            <SignOutButton onClick={handleSignOut} />
          </div>
        </div>

        <div style={{ padding: "32px 36px" }}>
          {tab === "keys" && <KeysView session={session} />}

          {tab === "payments" && !selectedPayment && (
            <PaymentsTab
              session={session}
              payments={payments}
              loading={paymentsLoading}
              error={paymentsError}
              onSelectPayment={setSelectedPayment}
            />
          )}

          {tab === "payments" && selectedPayment && (
            <ReceiptDetail sel={selectedPayment} onBack={() => setSelectedPayment(null)} />
          )}

          {tab === "settings" && (
            <SettingsTab
              session={session}
              onSave={(token, chain) => setSession(s => s ? { ...s, settlementToken: token, settlementChain: chain } : s)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
