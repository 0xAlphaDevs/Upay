"use client";

import { C, CHAINS } from "@/lib/constants";
import type { MerchantSession } from "@/lib/types";
import { CopyBtn } from "./primitives";

export function KeysView({ session }: { session: MerchantSession }) {
  const pkDisplay = session.publishableKey ?? session.publishableKeyPrefix ?? "pk_live_…";

  const reactSnippet = `<UPayButton\n  apiKey="${pkDisplay}"\n  amount="40"\n  token="${session.settlementToken}"\n  chain="${session.settlementChain}"\n/>`;

  return (
    <>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 26, letterSpacing: "-.02em", color: C.dark }}>API keys</h1>
        <p style={{ margin: 0, fontSize: 14, color: C.secondary }}>Signed in as <strong>{session.email}</strong></p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Settlement account */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontWeight: 600, fontSize: 14.5, color: C.dark }}>Settlement account</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 11, color: C.greenDark, background: C.greenBg, border: `1px solid ${C.greenBorder}`, padding: "3px 9px", borderRadius: 6 }}>● Active</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.purpleBg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-geist-mono)", fontWeight: 700, fontSize: 11, color: C.purple, flexShrink: 0 }}>7702</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 600, fontSize: 13.5, color: C.dark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.settlementAddress}</div>
                <div style={{ fontWeight: 400, fontSize: 12.5, color: C.muted, marginTop: 2 }}>{session.name} · {session.settlementToken} on {CHAINS.find(c => c.value === session.settlementChain)?.label ?? session.settlementChain}</div>
              </div>
              <CopyBtn text={session.settlementAddress} />
            </div>
          </div>

          {/* Publishable key */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
              <span style={{ fontWeight: 600, fontSize: 14.5, color: C.dark }}>Publishable key</span>
              <span style={{ fontWeight: 500, fontSize: 11, color: C.greenDark, background: C.greenBg, padding: "3px 8px", borderRadius: 5 }}>Safe in client</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#F8F6FC", border: "1px solid #EEE9F6", borderRadius: 9, padding: "11px 14px" }}>
              <code style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 13, color: C.purpleHover, wordBreak: "break-all" }}>{pkDisplay}</code>
              <CopyBtn text={pkDisplay} />
            </div>
          </div>

          {/* Secret key — coming soon */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, opacity: 0.6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
              <span style={{ fontWeight: 600, fontSize: 14.5, color: C.dark }}>Secret key</span>
              <span style={{ fontWeight: 600, fontSize: 9.5, letterSpacing: ".04em", textTransform: "uppercase", color: "#9A7FC0", background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, padding: "3px 8px", borderRadius: 5 }}>Coming soon</span>
            </div>
            <div style={{ background: "#F8F6FC", border: "1px solid #EEE9F6", borderRadius: 9, padding: "11px 14px" }}>
              <code style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 13, color: C.veryMuted }}>sk_live_••••••••••••••••••••••••••••••••</code>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 12, color: C.muted }}>Secret keys for server-side webhook verification — available soon.</p>
          </div>

          <div style={{ paddingTop: 4 }}>
            <button
              onClick={() => { if (confirm("This generates a new key pair. Old keys stay valid until revoked. Continue?")) window.location.reload(); }}
              style={{ background: "none", border: "none", fontWeight: 500, fontSize: 13, color: C.red, cursor: "pointer", padding: 0 }}
            >
              Roll keys (generate new pair)
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — Snippet */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14.5, color: C.dark }}>Drop it into your app</span>
              <CopyBtn text={reactSnippet} label="Copy snippet" />
            </div>
            <pre
              style={{ margin: 0, background: C.codeBg, borderRadius: 10, padding: 16, fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 13, lineHeight: 1.8, color: "#D8D2E2", overflowX: "auto" }}
              dangerouslySetInnerHTML={{ __html:
                `<span style="color:#8B82A0">&lt;</span><span style="color:#E89BD0">UPayButton</span>\n  apiKey=<span style="color:#7FD6A6">"${pkDisplay}"</span>\n  amount=<span style="color:#7FD6A6">"40"</span>\n  token=<span style="color:#7FD6A6">"${session.settlementToken}"</span>\n  chain=<span style="color:#7FD6A6">"${session.settlementChain}"</span>\n<span style="color:#8B82A0">/&gt;</span>`
              }}
            />
          </div>

          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5, color: C.dark, marginBottom: 14 }}>Quick start</div>
            {[
              { step: "1", title: "Install the SDK", code: "npm install @alphadevs_labs/upay-sdk" },
              { step: "2", title: "Add the button", code: `import { UPayButton } from '@alphadevs_labs/upay-sdk'` },
              { step: "3", title: "Handle success", code: `onSuccess={(txHash) => fulfillOrder(txHash)}` },
            ].map(({ step, title, code }) => (
              <div key={step} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: "1px solid #F4F2F7" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: C.purple, flexShrink: 0 }}>{step}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.dark, marginBottom: 4 }}>{title}</div>
                  <code style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12, color: C.purpleHover, background: "#F8F6FC", borderRadius: 5, padding: "2px 6px" }}>{code}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
