"use client";

import Link from "next/link";
import { UPayButton } from "@alphadevs_labs/upay-sdk";

const PK = process.env.NEXT_PUBLIC_UPAY_API_KEY ?? "pk_demo_placeholder";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const C = {
  bg: "#F9F7F2",
  purple: "#6B3FA0",
  purpleHover: "#5A3488",
  purpleLight: "#8454C6",
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
  green: "#1F9D62",
  greenDark: "#1F7A4D",
  greenBg: "#E9F6EF",
  greenBorder: "#CFEBDC",
  usdcBlue: "#2775CA",
  ethBlue: "#627EEA",
  solTeal: "#14C8A0",
} as const;

function ULogo({ size = 28 }: { size?: number }) {
  const r = Math.round(size * 0.285);
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: "linear-gradient(145deg,#8454C6,#6B3FA0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ color: "#fff", fontFamily: "var(--font-geist-sans)", fontWeight: 700, fontSize: size * 0.535 }}>U</span>
    </div>
  );
}

function HeroPayButton() {
  return (
    <UPayButton
      apiKey={PK}
      baseUrl={BASE_URL}
      amount="9"
      token="USDC"
      chain="base"
      metadata={{ productId: "aurora-hoodie", storeName: "Pixel Threads" }}
      label="Pay with UPay"
      className="upay-hero-btn"
    />
  );
}

function CodeBlock({ code, filename }: { code: string; filename: string }) {
  const lines = code.split("\n");
  return (
    <div style={{ background: C.codeBg, borderRadius: 16, overflow: "hidden", boxShadow: "0 30px 70px rgba(27,18,38,.28)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "13px 16px", borderBottom: "1px solid #2C2638" }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: "#3A3348", display: "inline-block" }} />)}
        <span style={{ marginLeft: 8, fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 12, color: "#7C7488" }}>{filename}</span>
      </div>
      <pre style={{ margin: 0, padding: 22, fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 14, lineHeight: 1.85, color: "#D8D2E2", overflowX: "auto" }}
        dangerouslySetInnerHTML={{ __html: lines.join("\n") }}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "var(--font-geist-sans), system-ui, sans-serif", color: C.ink }}>

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -180, left: "50%", transform: "translateX(-50%)", width: 900, height: 520, background: "radial-gradient(50% 50% at 50% 50%,rgba(124,79,194,.16),rgba(124,79,194,0))", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 1120, margin: "0 auto", padding: "84px 24px 72px", display: "grid", gridTemplateColumns: "1.04fr .96fr", gap: 56, alignItems: "center" }}>

          <div className="anim-upf">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 8px", background: "#fff", border: `1px solid ${C.purpleBorder}`, borderRadius: 999, fontWeight: 500, fontSize: 12.5, color: C.purpleHover, boxShadow: "0 1px 2px rgba(27,22,34,.04)" }}>
              <span style={{ width: 16, height: 16, borderRadius: 5, background: "linear-gradient(145deg,#8454C6,#6B3FA0)", display: "inline-block" }} />
              Powered by Particle Universal Accounts
            </div>
            <h1 style={{ margin: "22px 0 0", fontWeight: 700, fontSize: 60, lineHeight: 1.02, letterSpacing: "-.035em", color: C.dark }}>
              Any coin.<br />Any chain.<br />One button.
            </h1>
            <p style={{ margin: "22px 0 0", maxWidth: 460, fontWeight: 400, fontSize: 18, lineHeight: 1.55, color: C.body }}>
              UPay is a drop-in crypto checkout. Your customer pays with whatever they hold, on whatever chain it lives on — in a single tap. You settle in the exact stablecoin and chain you want.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 30 }}>
              <Link href="/docs" style={{ background: C.purple, color: "#fff", borderRadius: 11, padding: "14px 22px", fontWeight: 600, fontSize: 15.5, letterSpacing: "-.01em", textDecoration: "none", boxShadow: "0 1px 2px rgba(107,63,160,.35),0 12px 26px rgba(107,63,160,.3)" }}>
                Start integrating
              </Link>
              <Link href="/dashboard" style={{ background: "#fff", color: C.ink, border: "1px solid #E6E1EC", borderRadius: 11, padding: "14px 22px", fontWeight: 600, fontSize: 15.5, textDecoration: "none", boxShadow: "0 1px 2px rgba(27,22,34,.08),0 12px 26px rgba(27,22,34,.13)" }}>
                View dashboard →
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 26, fontWeight: 500, fontSize: 13, color: C.muted }}>
              {[
                { color: C.green, label: "Non-custodial" },
                { color: "#7C4FC2", label: "No bridging" },
                { color: C.muted, label: "No network switching" },
              ].map(({ color, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Demo card */}
          <div className="anim-upf-delay">
            <div className="anim-floaty" style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18, boxShadow: "0 1px 3px rgba(27,22,34,.05),0 30px 70px rgba(27,18,38,.13)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 16px", background: "#FBFAFC", borderBottom: `1px solid ${C.borderLight}` }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#E4E0EA", display: "inline-block" }} />)}
                <span style={{ marginLeft: 8, fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 12, color: C.veryMuted }}>pixelthreads.xyz</span>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ position: "relative", height: 172, borderRadius: 12, background: "repeating-linear-gradient(135deg,#F4EFFA,#F4EFFA 11px,#EEE7F8 11px,#EEE7F8 22px)", border: "1px solid #EAE3F4", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 12 }}>
                  <span style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 11, color: "#A98FCB", background: "#fff", padding: "4px 9px", borderRadius: 6, border: "1px solid #EAE3F4" }}>product shot</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 16 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: C.dark }}>Aurora Hoodie</div>
                    <div style={{ fontWeight: 400, fontSize: 13.5, color: C.muted, marginTop: 2 }}>Limited drop · unisex</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 600, fontSize: 18, color: C.dark }}>$9</div>
                </div>
                <HeroPayButton />
                <div style={{ textAlign: "center", marginTop: 11, fontWeight: 500, fontSize: 11.5, color: C.veryMuted }}>🔒 Pay with any token · settles instantly</div>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 14, fontWeight: 500, fontSize: 12.5, color: C.muted }}>↑ This button is live. Click it.</div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", color: "#9A7FC0" }}>How it works</div>
          <h2 style={{ margin: "12px 0 0", fontWeight: 700, fontSize: 38, lineHeight: 1.1, letterSpacing: "-.03em", color: C.dark }}>Chain abstraction, made invisible</h2>
          <p style={{ margin: "14px 0 0", fontWeight: 400, fontSize: 17, lineHeight: 1.55, color: C.body }}>The customer never picks a chain, never bridges, never switches networks. UPay routes everything behind one tap.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginTop: 46 }}>
          {[
            {
              num: "1", numBg: C.purpleBg, numColor: C.purple,
              title: "Merchant adds the button",
              body: "Drop in one component or a single script tag. Five lines and you accept crypto.",
            },
            {
              num: "2", numBg: C.purpleBg, numColor: C.purple,
              title: "Customer connects wallet",
              body: "Any wallet, any chain, any token they already hold. Social login works too.",
            },
            {
              num: "3", numBg: C.greenBg, numColor: C.green,
              title: "Payment settles cross-chain",
              body: "You receive the exact stablecoin and chain you chose. Webhook fires, order is paid.",
            },
          ].map(({ num, numBg, numColor, title, body }) => (
            <div key={num} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: 26, boxShadow: "0 1px 3px rgba(27,22,34,.04)" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: numBg, color: numColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-geist-mono)", fontWeight: 700, fontSize: 16 }}>{num}</div>
              <div style={{ marginTop: 16, fontWeight: 600, fontSize: 18, color: C.dark }}>{title}</div>
              <p style={{ margin: "8px 0 0", fontWeight: 400, fontSize: 14.5, lineHeight: 1.55, color: "#6B6577" }}>{body}</p>
            </div>
          ))}
        </div>

        {/* Converge visual */}
        <div style={{ marginTop: 18, background: "linear-gradient(180deg,#fff,#FCFBFE)", border: `1px solid ${C.border}`, borderRadius: 18, padding: 34, boxShadow: "0 1px 3px rgba(27,22,34,.04)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 22, alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: ".05em", textTransform: "uppercase", color: C.veryMuted, marginBottom: 12 }}>Customer holds</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { color: C.usdcBlue, amount: "120 USDC", chain: "Arbitrum" },
                  { color: C.ethBlue, amount: "0.4 ETH", chain: "Base" },
                  { color: C.solTeal, amount: "9 SOL", chain: "Solana" },
                ].map(({ color, amount, chain }) => (
                  <span key={chain} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 13px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 11, fontWeight: 500, fontSize: 13.5, color: C.ink, boxShadow: "0 1px 2px rgba(27,22,34,.04)" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
                    {amount} <span style={{ color: C.veryMuted, fontWeight: 400 }}>· {chain}</span>
                  </span>
                ))}
              </div>
            </div>
            <div style={{ fontWeight: 300, fontSize: 30, color: "#CFC7D8" }}>→</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(145deg,#8454C6,#6B3FA0)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 30px rgba(107,63,160,.4)" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 30, letterSpacing: "-.02em" }}>U</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: C.purpleHover }}>UPay routing</div>
              <div style={{ fontWeight: 500, fontSize: 11.5, color: C.veryMuted, textAlign: "center", maxWidth: 130 }}>picks the best path, no bridging UI</div>
            </div>
            <div style={{ fontWeight: 300, fontSize: 30, color: "#CFC7D8" }}>→</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: ".05em", textTransform: "uppercase", color: C.veryMuted, marginBottom: 12 }}>Merchant receives</div>
              <div style={{ background: "#fff", border: `1px solid ${C.greenBorder}`, borderRadius: 13, padding: 16, boxShadow: "0 1px 3px rgba(31,157,98,.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.usdcBlue, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 700, fontSize: 22, color: C.dark }}>40.00</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: C.ink }}>USDC</span>
                </div>
                <div style={{ marginTop: 7, fontWeight: 500, fontSize: 13, color: C.greenDark }}>settled on Base · ~8s</div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.borderLight}`, fontFamily: "var(--font-geist-mono)", fontWeight: 500, fontSize: 12, color: C.veryMuted }}>webhook → order.paid ✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SDK SNIPPET */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "56px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: ".92fr 1.08fr", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", color: "#9A7FC0" }}>Built for developers</div>
            <h2 style={{ margin: "12px 0 0", fontWeight: 700, fontSize: 34, lineHeight: 1.12, letterSpacing: "-.03em", color: C.dark }}>Five lines to accept any coin on any chain</h2>
            <p style={{ margin: "14px 0 0", fontWeight: 400, fontSize: 16.5, lineHeight: 1.6, color: C.body }}>A React component, a script tag, or a server-side session. UPay handles wallet connection, routing, settlement, and the webhook. You handle the order.</p>
            <Link href="/docs" style={{ display: "inline-block", marginTop: 24, background: "#fff", color: C.ink, border: "1px solid #E6E1EC", borderRadius: 11, padding: "13px 20px", fontWeight: 600, fontSize: 15, textDecoration: "none", boxShadow: "0 1px 2px rgba(27,22,34,.04)" }}>
              Read the docs →
            </Link>
          </div>
          <CodeBlock filename="checkout.jsx" code={
            `<span style="color:#B98BE8">import</span> { UPayButton } <span style="color:#B98BE8">from</span> <span style="color:#7FD6A6">'@alphadevs_labs/upay-sdk'</span>\n\n<span style="color:#8B82A0">&lt;</span><span style="color:#E89BD0">UPayButton</span>\n  amount=<span style="color:#7FD6A6">"40"</span>\n  token=<span style="color:#7FD6A6">"USDC"</span>\n  chain=<span style="color:#7FD6A6">"base"</span>\n  onSuccess={(payment) =&gt; fulfill(payment.txHashes[0])}\n<span style="color:#8B82A0">/&gt;</span>`
          } />
        </div>
      </div>

      {/* TRUST */}
      <div style={{ background: "#fff", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "56px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: 30, letterSpacing: "-.03em", color: C.dark }}>Safe by architecture</h2>
            <p style={{ margin: "12px auto 0", maxWidth: 520, fontWeight: 400, fontSize: 16, lineHeight: 1.55, color: C.body }}>UPay never touches custody. Funds move directly from the customer's account to yours.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {[
              { icon: "🔒", iconBg: C.greenBg, title: "Non-custodial", body: "UPay never holds funds. Settlement is account-to-account, verifiable on-chain." },
              { icon: "7702", iconBg: C.purpleBg, iconStyle: { fontFamily: "var(--font-geist-mono)", fontWeight: 700, fontSize: 13, color: C.purple } as React.CSSProperties, title: "EIP-7702 accounts", body: "Smart-account UX on the wallet users already have — no migration, no new address." },
              { icon: "P", iconBg: "linear-gradient(145deg,#8454C6,#6B3FA0)", iconStyle: { color: "#fff", fontWeight: 700, fontSize: 15 } as React.CSSProperties, title: "Particle Universal Accounts", body: "Cross-chain routing and gas abstraction powered by Particle Network infrastructure." },
            ].map(({ icon, iconBg, iconStyle, title, body }) => (
              <div key={title} style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, background: C.almostWhite }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: iconStyle ? undefined : 18, ...iconStyle }}>
                  {icon}
                </div>
                <div style={{ marginTop: 14, fontWeight: 600, fontSize: 16.5, color: C.dark }}>{title}</div>
                <p style={{ margin: "7px 0 0", fontWeight: 400, fontSize: 14, lineHeight: 1.55, color: "#6B6577" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BUSINESS MODEL */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ background: "linear-gradient(135deg,#2A1B47,#4B2D7E)", borderRadius: 20, padding: 48, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, boxShadow: "0 30px 70px rgba(42,27,71,.3)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", right: -80, top: -80, width: 340, height: 340, background: "radial-gradient(50% 50% at 50% 50%,rgba(167,124,224,.35),rgba(167,124,224,0))", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontWeight: 600, fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#C9B3E8" }}>Business model</div>
            <h2 style={{ margin: "12px 0 0", fontWeight: 700, fontSize: 32, lineHeight: 1.15, letterSpacing: "-.03em", color: "#fff", maxWidth: 560 }}>A small bps fee on settled volume.<br />The Stripe model.</h2>
            <p style={{ margin: "14px 0 0", fontWeight: 400, fontSize: 16, lineHeight: 1.55, color: "#D6CCE8", maxWidth: 480 }}>No setup fees, no monthly minimum. You pay only when you get paid — a few basis points on what actually settles.</p>
          </div>
          <div style={{ position: "relative", textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-geist-mono)", fontWeight: 700, fontSize: 64, color: "#fff", letterSpacing: "-.03em", lineHeight: 1 }}>0.25<span style={{ fontSize: 28 }}>%</span></div>
            <div style={{ fontWeight: 500, fontSize: 14, color: "#C9B3E8", marginTop: 4 }}>per settled payment</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px 80px", textAlign: "center" }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 40, lineHeight: 1.1, letterSpacing: "-.035em", color: C.dark }}>Start accepting crypto<br />that actually feels like Stripe</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 28 }}>
          <Link href="/docs" style={{ background: C.purple, color: "#fff", border: "none", borderRadius: 11, padding: "15px 26px", fontWeight: 600, fontSize: 16, textDecoration: "none", boxShadow: "0 1px 2px rgba(107,63,160,.35),0 12px 26px rgba(107,63,160,.3)" }}>
            Start integrating
          </Link>
          <Link href="/dashboard" style={{ background: "#fff", color: C.ink, border: "1px solid #E6E1EC", borderRadius: 11, padding: "15px 26px", fontWeight: 600, fontSize: 16, textDecoration: "none", boxShadow: "0 1px 2px rgba(27,22,34,.04)" }}>
            View dashboard →
          </Link>
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
            {[
              { href: "/docs", label: "Docs" },
              { href: "/dashboard", label: "Dashboard" },
            ].map(({ href, label }) => (
              <Link key={label} href={href} style={{ padding: "7px 12px", borderRadius: 8, fontWeight: 500, fontSize: 13.5, color: C.body, textDecoration: "none" }}>{label}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid #F4F2F7" }}>
          <div style={{ textAlign: "center", paddingBottom: 16, fontWeight: 400, fontSize: 12, color: C.veryMuted }}>
            © <a href="https://www.alphadevs.dev/" target="_blank" rel="noopener noreferrer" style={{ color: C.veryMuted, textDecoration: "none" }}>alphadevs.dev</a>
          </div>
        </div>
      </div>

    </div>
  );
}
