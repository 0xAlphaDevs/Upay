"use client";

import { C, CHAINS } from "@/lib/constants";
import type { MerchantSession, Payment } from "@/lib/types";
import { tokenColor, shortId, formatDate, truncate, StatusBadge } from "./primitives";

export function PaymentsTab({
  session,
  payments,
  loading,
  error,
  onSelectPayment,
}: {
  session: MerchantSession;
  payments: Payment[];
  loading: boolean;
  error: string;
  onSelectPayment: (p: Payment) => void;
}) {
  const chainLabel = CHAINS.find(c => c.value === session.settlementChain)?.label ?? session.settlementChain;

  const stats = [
    { label: "Total payments", value: String(payments.length) },
    { label: "Settled",        value: String(payments.filter(p => p.status === "settled").length) },
    { label: "Pending",        value: String(payments.filter(p => p.status !== "settled").length) },
    { label: "Volume",         value: payments.reduce((s, p) => s + parseFloat(p.amount), 0).toFixed(2) + " " + session.settlementToken },
  ];

  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", color: C.dark }}>Payments</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: C.secondary }}>
          Every payment settles to {session.settlementToken} on {chainLabel}, no matter what the customer paid with.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 13, padding: 16 }}>
            <div style={{ fontWeight: 500, fontSize: 12, color: C.muted }}>{label}</div>
            <div style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 700, fontSize: 22, color: C.dark, marginTop: 5 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.3fr 1.2fr 1.1fr .8fr", gap: 12, padding: "13px 18px", background: "#FBFAFC", borderBottom: "1px solid #F0EDF4", fontWeight: 600, fontSize: 11.5, letterSpacing: ".03em", textTransform: "uppercase", color: C.veryMuted }}>
          <div>Payment</div><div>Paid with</div><div>Settled</div><div>Customer</div><div>Status</div>
        </div>

        {loading && (
          <div style={{ padding: "32px 18px", textAlign: "center", fontSize: 14, color: C.muted }}>Loading…</div>
        )}
        {error && (
          <div style={{ padding: "24px 18px", fontSize: 13, color: C.red }}>{error}</div>
        )}
        {!loading && !error && payments.length === 0 && (
          <div style={{ padding: "40px 18px", textAlign: "center", fontSize: 14, color: C.muted }}>
            No payments yet. Share your checkout link to get started.
          </div>
        )}
        {!loading && payments.map(p => {
          const via = p.source_breakdown?.token;
          const viaChain = p.source_breakdown?.chain;
          return (
            <div
              key={p.id}
              onClick={() => onSelectPayment(p)}
              style={{ display: "grid", gridTemplateColumns: "1.4fr 1.3fr 1.2fr 1.1fr .8fr", gap: 12, padding: "15px 18px", borderBottom: "1px solid #F4F2F7", cursor: "pointer", alignItems: "center" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#FCFBFE")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}
            >
              <div>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 600, fontSize: 13.5, color: C.dark }}>{shortId(p.id)}</div>
                <div style={{ fontWeight: 400, fontSize: 12, color: C.veryMuted, marginTop: 2 }}>{formatDate(p.created_at)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {via ? (
                  <>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: tokenColor(via), display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontWeight: 500, fontSize: 13, color: C.body }}>{via}{viaChain ? ` · ${viaChain}` : ""}</span>
                  </>
                ) : (
                  <span style={{ fontSize: 13, color: C.muted }}>—</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: tokenColor(p.settle_token), display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 600, fontSize: 13.5, color: C.dark }}>{parseFloat(p.amount).toFixed(2)}</span>
              </div>
              <div style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 13, color: C.secondary }}>{truncate(p.payer_address)}</div>
              <StatusBadge status={p.status} />
            </div>
          );
        })}
      </div>
    </>
  );
}
