"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { UPay } from "@alphadevs_labs/upay-sdk";

const PK = process.env.NEXT_PUBLIC_UPAY_API_KEY ?? "pk_live_8Kwz0Pn4aR2tVmH9";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const C = {
  bg: "#F9F7F2",
  purple: "#6B3FA0",
  purpleHover: "#5A3488",
  dark: "#15101C",
  ink: "#1B1622",
  body: "#4A4458",
  secondary: "#6B6577",
  muted: "#8B8595",
  veryMuted: "#A39DAD",
  border: "#ECE8F1",
  borderLight: "#F0EDF4",
  purpleBg: "#F4EFFA",
  purpleBorder: "#E7DEF5",
  almostWhite: "#FCFBFE",
  codeBg: "#1C1726",
} as const;

function ULogo({ size = 28 }: { size?: number }) {
  const r = Math.round(size * 0.285);
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: "linear-gradient(145deg,#8454C6,#6B3FA0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ color: "#fff", fontFamily: "var(--font-geist-sans)", fontWeight: 700, fontSize: size * 0.535 }}>U</span>
    </div>
  );
}

function CopyButton({ text, style }: { text: string; style?: React.CSSProperties }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{ background: "#2C2638", color: "#C9C2D4", border: "none", borderRadius: 7, padding: "7px 12px", fontWeight: 600, fontSize: 12.5, cursor: "pointer", ...style }}>
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function PurpleCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{ background: "#F1EEF6", color: C.purpleHover, border: "none", borderRadius: 7, padding: "7px 12px", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

const REACT_CODE = `import { UPayButton } from '@alphadevs_labs/upay-sdk'

<UPayButton
  apiKey="pk_live_8Kwz0Pn4aR2tVmH9"
  amount="40"
  token="USDC"
  chain="base"
  onSuccess={(payment) => fulfill(payment.txHashes[0])}
/>`;

const SCRIPT_CODE = `<script src="https://cdn.upay.xyz/v1.js"></script>
<button data-upay data-amount="40" data-settle="USDC:base">
  Pay with UPay
</button>`;

const API_CODE = `const session = await upay.sessions.create({
  amount: 40,
  settle: { token: 'USDC', chain: 'base' },
  success_url: 'https://pixelthreads.xyz/done'
})
return redirect(session.url)`;

const SECTIONS = ["install", "try", "react", "script", "api"] as const;
type Section = typeof SECTIONS[number];

const SECTION_LABELS: Record<Section, string> = {
  install: "Installation",
  try: "Try it live",
  react: "React component",
  script: "Script tag",
  api: "API session",
};

export default function DocsPage() {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("install");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const handleDemo = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const client = new UPay({ apiKey: PK, baseUrl: BASE_URL });
      const session = await client.createCheckout({ amount: "40", token: "USDC", chain: "base" });
      client.openCheckout(session.id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "var(--font-geist-sans), system-ui, sans-serif", color: C.ink }}>

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <ULogo size={28} />
            <span style={{ fontWeight: 600, fontSize: 16, color: C.ink }}>UPay</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link href="/" style={{ padding: "7px 12px", borderRadius: 8, fontWeight: 500, fontSize: 14, color: C.body, textDecoration: "none" }}>Home</Link>
            <Link href="/docs" style={{ padding: "7px 12px", borderRadius: 8, fontWeight: 500, fontSize: 14, color: C.purple, background: C.purpleBg, textDecoration: "none" }}>Docs</Link>
            <Link href="/dashboard" style={{ padding: "7px 12px", borderRadius: 8, fontWeight: 500, fontSize: 14, color: C.body, textDecoration: "none" }}>Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* DOCS BODY */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px 80px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 48 }} className="anim-upf">

        {/* Sidebar */}
        <div style={{ alignSelf: "start", position: "sticky", top: 88 }}>
          <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: ".05em", textTransform: "uppercase", color: C.veryMuted, marginBottom: 12 }}>Documentation</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, fontWeight: 500, fontSize: 14 }}>
            {SECTIONS.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                style={{
                  padding: "8px 11px", borderRadius: 8, textDecoration: "none", transition: "all .12s",
                  color: activeSection === id ? C.purple : C.body,
                  background: activeSection === id ? C.purpleBg : "transparent",
                }}
              >
                {SECTION_LABELS[id]}
              </a>
            ))}
            <span style={{ padding: "8px 11px", borderRadius: 8, color: "#B3ADBC", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              Webhooks
              <span style={{ fontWeight: 600, fontSize: 9.5, letterSpacing: ".04em", textTransform: "uppercase", color: "#9A7FC0", background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, padding: "2px 6px", borderRadius: 5 }}>Soon</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: 36, letterSpacing: "-.03em", color: C.dark }}>UPay SDK</h1>
          <p style={{ margin: "12px 0 0", fontWeight: 400, fontSize: 17, lineHeight: 1.6, color: C.body, maxWidth: 560 }}>
            Accept any token on any chain and settle in the stablecoin you choose. Pick the integration that fits your stack.
          </p>

          {/* Installation */}
          <div id="install" style={{ marginTop: 36 }}>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: 20, color: C.dark }}>Installation</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14, background: C.codeBg, borderRadius: 11, padding: "14px 16px" }}>
              <code style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 14, color: "#D8D2E2" }}>
                <span style={{ color: "#7FD6A6" }}>npm</span> install @alphadevs_labs/upay-sdk
              </code>
              <CopyButton text="npm install @alphadevs_labs/upay-sdk" />
            </div>
          </div>

          {/* Try it live */}
          <div id="try" style={{ marginTop: 36 }}>
            <h2 style={{ margin: 0, fontWeight: 600, fontSize: 20, color: C.dark }}>Try it live</h2>
            <p style={{ margin: "8px 0 0", fontWeight: 400, fontSize: 15, color: C.secondary }}>This is the real component. Click to open the checkout.</p>
            <div style={{ marginTop: 16, background: C.almostWhite, border: `1px solid ${C.border}`, borderRadius: 14, padding: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: ".04em", textTransform: "uppercase", color: C.veryMuted }}>UPayButton · $40.00</div>
              <button
                onClick={handleDemo}
                disabled={loading}
                style={{ background: loading ? C.purpleHover : C.purple, color: "#fff", border: "none", borderRadius: 12, padding: "14px 26px", fontWeight: 600, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 9, boxShadow: "0 1px 2px rgba(107,63,160,.4),0 12px 24px rgba(107,63,160,.32)", transition: "background .15s" }}
              >
                <span style={{ width: 19, height: 19, borderRadius: 6, background: "rgba(255,255,255,.22)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>U</span>
                {loading ? "Opening checkout…" : "Pay with UPay"}
              </button>
            </div>
          </div>

          {/* React component */}
          <div id="react" style={{ marginTop: 36 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontWeight: 600, fontSize: 20, color: C.dark }}>React component</h2>
              <PurpleCopyButton text={REACT_CODE} />
            </div>
            <pre style={{ margin: "14px 0 0", background: C.codeBg, borderRadius: 12, padding: 20, fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 13.5, lineHeight: 1.8, color: "#D8D2E2", overflowX: "auto" }}
              dangerouslySetInnerHTML={{ __html:
                `<span style="color:#B98BE8">import</span> { UPayButton } <span style="color:#B98BE8">from</span> <span style="color:#7FD6A6">'@alphadevs_labs/upay-sdk'</span>\n\n<span style="color:#8B82A0">&lt;</span><span style="color:#E89BD0">UPayButton</span>\n  apiKey=<span style="color:#7FD6A6">"pk_live_8Kwz0Pn4aR2tVmH9"</span>\n  amount={<span style="color:#E8B57F">40</span>}\n  settle={{ token: <span style="color:#7FD6A6">'USDC'</span>, chain: <span style="color:#7FD6A6">'base'</span> }}\n  onPaid={(tx) =&gt; fulfill(tx.hash)}\n<span style="color:#8B82A0">/&gt;</span>`
              }}
            />
          </div>

          {/* Script tag */}
          <div id="script" style={{ marginTop: 36 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontWeight: 600, fontSize: 20, color: C.dark }}>Script tag</h2>
              <PurpleCopyButton text={SCRIPT_CODE} />
            </div>
            <pre style={{ margin: "14px 0 0", background: C.codeBg, borderRadius: 12, padding: 20, fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 13.5, lineHeight: 1.8, color: "#D8D2E2", overflowX: "auto" }}
              dangerouslySetInnerHTML={{ __html:
                `<span style="color:#8B82A0">&lt;</span><span style="color:#E89BD0">script</span> src=<span style="color:#7FD6A6">"https://cdn.upay.xyz/v1.js"</span><span style="color:#8B82A0">&gt;&lt;/</span><span style="color:#E89BD0">script</span><span style="color:#8B82A0">&gt;</span>\n<span style="color:#8B82A0">&lt;</span><span style="color:#E89BD0">button</span> data-upay data-amount=<span style="color:#7FD6A6">"40"</span> data-settle=<span style="color:#7FD6A6">"USDC:base"</span><span style="color:#8B82A0">&gt;</span>\n  Pay with UPay\n<span style="color:#8B82A0">&lt;/</span><span style="color:#E89BD0">button</span><span style="color:#8B82A0">&gt;</span>`
              }}
            />
          </div>

          {/* API session */}
          <div id="api" style={{ marginTop: 36 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontWeight: 600, fontSize: 20, color: C.dark }}>API session</h2>
              <PurpleCopyButton text={API_CODE} />
            </div>
            <pre style={{ margin: "14px 0 0", background: C.codeBg, borderRadius: 12, padding: 20, fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 13.5, lineHeight: 1.8, color: "#D8D2E2", overflowX: "auto" }}
              dangerouslySetInnerHTML={{ __html:
                `<span style="color:#B98BE8">const</span> session = <span style="color:#B98BE8">await</span> upay.sessions.<span style="color:#E89BD0">create</span>({\n  amount: <span style="color:#E8B57F">40</span>,\n  settle: { token: <span style="color:#7FD6A6">'USDC'</span>, chain: <span style="color:#7FD6A6">'base'</span> },\n  success_url: <span style="color:#7FD6A6">'https://pixelthreads.xyz/done'</span>\n})\n<span style="color:#B98BE8">return</span> redirect(session.url)`
              }}
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, background: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 18 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <ULogo size={26} />
            <span style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>UPay</span>
            <span style={{ fontWeight: 400, fontSize: 13, color: C.veryMuted, marginLeft: 6 }}>© 2026 · tryupay.xyz</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Link href="/" style={{ padding: "7px 12px", borderRadius: 8, fontWeight: 500, fontSize: 13.5, color: C.body, textDecoration: "none" }}>Home</Link>
            <Link href="/docs" style={{ padding: "7px 12px", borderRadius: 8, fontWeight: 500, fontSize: 13.5, color: C.body, textDecoration: "none" }}>Docs</Link>
            <Link href="/dashboard" style={{ padding: "7px 12px", borderRadius: 8, fontWeight: 500, fontSize: 13.5, color: C.body, textDecoration: "none" }}>Dashboard</Link>
          </div>
        </div>
      </div>

    </div>
  );
}
