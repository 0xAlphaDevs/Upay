"use client";

import { C, CHAINS } from "@/lib/constants";
import type { Payment } from "@/lib/types";
import { tokenColor, shortId, formatDate, truncate, StatusBadge } from "./primitives";

export function ReceiptDetail({ sel, onBack }: { sel: Payment; onBack: () => void }) {
  const amount = parseFloat(sel.amount);
  const via = sel.source_breakdown?.token ?? "—";
  const viaChain = sel.source_breakdown?.chain ?? "—";
  const txHash = Array.isArray(sel.tx_hashes)
    ? sel.tx_hashes[0]
    : Object.values(sel.tx_hashes ?? {})[0];

  return (
    <>
      <button onClick={onBack} style={{ background: "none", border: "none", fontWeight: 500, fontSize: 13.5, color: C.secondary, cursor: "pointer", padding: 0, marginBottom: 18 }}>
        ← All payments
      </button>
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", maxWidth: 680 }}>
        <div style={{ padding: "24px 26px", borderBottom: `1px solid ${C.borderLight}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 12.5, color: C.muted }}>{shortId(sel.id)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 7 }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: tokenColor(sel.settle_token), display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 700, fontSize: 30, color: C.dark, letterSpacing: "-.02em" }}>{amount.toFixed(2)}</span>
                <span style={{ fontWeight: 600, fontSize: 16, color: C.ink }}>{sel.settle_token}</span>
              </div>
              <div style={{ fontWeight: 500, fontSize: 13, color: C.greenDark, marginTop: 5 }}>
                Settled on {CHAINS.find(c => c.value === sel.settle_chain)?.label ?? sel.settle_chain} · {formatDate(sel.created_at)}
              </div>
            </div>
            <StatusBadge status={sel.status} />
          </div>
        </div>
        <div style={{ padding: "22px 26px" }}>
          {[
            { label: "Customer paid", value: via !== "—" ? `${amount.toFixed(2)} ${via} · ${viaChain}` : "—" },
            { label: "UPay fee (0.25%)", value: `−${(amount * 0.0025).toFixed(4)} ${sel.settle_token}`, mono: true },
            { label: "Net to you", value: `${(amount * 0.9975).toFixed(4)} ${sel.settle_token}`, mono: true, bold: true },
            { label: "Customer", value: truncate(sel.payer_address), mono: true },
          ].map(({ label, value, mono, bold }, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F4F2F7" }}>
              <span style={{ fontWeight: 400, fontSize: 14, color: C.secondary }}>{label}</span>
              <span style={{ fontWeight: bold ? 600 : 500, fontSize: 14, fontFamily: mono ? "var(--font-geist-mono)" : undefined, color: C.dark }}>{value}</span>
            </div>
          ))}
          {txHash && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0" }}>
              <span style={{ fontWeight: 400, fontSize: 14, color: C.secondary }}>Transaction</span>
              <span style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 13.5, color: C.purple }}>{truncate(txHash)}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
