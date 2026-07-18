"use client";

import { useState } from "react";
import { C, TOKEN_COLOR } from "@/lib/constants";

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function tokenColor(t: string) {
  return TOKEN_COLOR[t?.toUpperCase()] ?? "#8B8595";
}

export function shortId(id: string) {
  return "upay_" + id.replace(/-/g, "").slice(0, 6).toUpperCase();
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function truncate(addr: string) {
  if (!addr || addr.length < 12) return addr;
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

// ── UI atoms ──────────────────────────────────────────────────────────────────

export function ULogo({ size = 28 }: { size?: number }) {
  const r = Math.round(size * 0.285);
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: "linear-gradient(145deg,#8454C6,#6B3FA0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: size * 0.535 }}>U</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 11.5, color: C.greenDark, background: C.greenBg, border: `1px solid ${C.greenBorder}`, padding: "3px 9px", borderRadius: 6 }}>
      ● {status}
    </span>
  );
}

export function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      style={{ background: "#fff", border: "1px solid #E6E1EC", borderRadius: 7, padding: "6px 11px", fontWeight: 600, fontSize: 12, color: C.ink, cursor: "pointer", whiteSpace: "nowrap" }}
    >
      {copied ? "Copied ✓" : (label ?? "Copy")}
    </button>
  );
}

export function SignOutButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: hovered ? "#991B1B" : C.red,
        border: "none", borderRadius: 9, padding: "7px 13px",
        fontWeight: 500, fontSize: 13, color: "#fff",
        cursor: "pointer", transition: "all .15s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Sign out
    </button>
  );
}
