"use client";

import { UPayButton } from "@alphadevs_labs/upay-sdk";

const PK = process.env.NEXT_PUBLIC_UPAY_API_KEY ?? "pk_demo_placeholder";
const UPAY_URL = process.env.NEXT_PUBLIC_UPAY_URL ?? "http://localhost:3000";

const C = {
  purple: "#6B3FA0",
  purpleHover: "#5A3488",
  dark: "#15101C",
  ink: "#1B1622",
  body: "#4A4458",
  secondary: "#6B6577",
  muted: "#8B8595",
  veryMuted: "#A39DAD",
  border: "#ECE8F1",
} as const;

const products = [
  {
    id: "hoodie-aurora",
    name: "Aurora Hoodie",
    desc: "Limited drop · unisex",
    priceStr: "0.01",
  },
];

export default function StorePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9F7F2", fontFamily: "'Geist', system-ui, sans-serif", color: C.ink }}>

      {/* Header */}
      <div style={{ background: C.dark, color: "#fff" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-.02em" }}>Pixel Threads</span>
            <span style={{ width: 1, height: 18, background: "#3A3348", display: "inline-block" }} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 500, fontSize: 12.5, color: "#B3A9C4" }}>
              Powered by
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 16, height: 16, borderRadius: 5, background: "linear-gradient(145deg,#8454C6,#6B3FA0)", display: "inline-block" }} />
                UPay
              </span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontWeight: 500, fontSize: 14, color: "#C9C2D4" }}>
            <span>Shop</span><span>About</span><span>🛒</span>
          </div>
        </div>
      </div>

      {/* Products */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ marginBottom: 34 }}>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: 36, letterSpacing: "-.03em", color: C.dark }}>New drop — Summer &apos;26</h1>
          <p style={{ margin: "10px 0 0", fontWeight: 400, fontSize: 16, color: C.secondary }}>Pay with any token, any chain. Checkout in one tap.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
          {products.map(p => (
            <div key={p.id} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(27,22,34,.04)" }}>
              <div style={{ position: "relative", height: 230, background: "repeating-linear-gradient(135deg,#F4EFFA,#F4EFFA 12px,#EEE7F8 12px,#EEE7F8 24px)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 12, borderBottom: "1px solid #EEE7F8" }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 500, fontSize: 11, color: "#A98FCB", background: "#fff", padding: "4px 9px", borderRadius: 6, border: "1px solid #EAE3F4" }}>product shot</span>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: C.dark }}>{p.name}</div>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 600, fontSize: 16, color: C.dark, whiteSpace: "nowrap" }}>${p.priceStr}</div>
                </div>
                <div style={{ fontWeight: 400, fontSize: 13.5, color: C.muted, marginTop: 3 }}>{p.desc}</div>
                <div style={{ marginTop: 16 }}>
                  <UPayButton
                    apiKey={PK}
                    baseUrl={UPAY_URL}
                    amount={p.priceStr}
                    metadata={{ productId: p.id, storeName: "Pixel Threads" }}
                    label="Pay with UPay"
                    className="upay-btn"
                    onSuccess={(payment) => {
                      console.log("Payment complete:", payment);
                      alert(`Payment confirmed!\nTx: ${payment.txHashes?.[0] ?? "n/a"}`);
                    }}
                    onError={(err) => {
                      console.error("Payment error:", err);
                      alert(`Payment error: ${err.message}`);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 30, textAlign: "center", fontWeight: 500, fontSize: 13, color: C.veryMuted }}>
          The Pay button is a single UPay component dropped into this page. Click any to checkout.
        </div>
      </div>
    </div>
  );
}
