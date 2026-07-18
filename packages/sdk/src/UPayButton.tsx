"use client";

import React, { useState, useCallback } from "react";
import { UPay } from "./client";
import type { UPayButtonProps, UPayPayment } from "./types";

const defaultStyles = {
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "opacity 0.15s, transform 0.1s",
    minHeight: "44px",
    letterSpacing: "-0.01em",
  } as React.CSSProperties,
  loading: {
    opacity: 0.7,
    cursor: "not-allowed",
  } as React.CSSProperties,
};

const UPayLogo = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="9" cy="9" r="8.5" stroke="rgba(255,255,255,0.6)" />
    <path
      d="M5.5 6.5L9 11.5L12.5 6.5"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Spinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    style={{ animation: "upay-spin 0.8s linear infinite" }}
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="2"
    />
    <path
      d="M8 2a6 6 0 0 1 6 6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <style>{`@keyframes upay-spin{to{transform:rotate(360deg)}}`}</style>
  </svg>
);

export function UPayButton({
  apiKey,
  baseUrl,
  amount,
  token,
  chain,
  metadata,
  onSuccess,
  onError,
  label = "Pay with UPay",
  className,
}: UPayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const client = new UPay({ apiKey, baseUrl });
      const session = await client.createCheckout({
        amount,
        token,
        chain,
        metadata,
      });
      client.openCheckout(session.id);

      const handleSuccess = (e: Event) => {
        const payment = (e as CustomEvent<UPayPayment>).detail;
        onSuccess?.(payment);
        window.removeEventListener("upay:payment-success", handleSuccess);
      };
      window.addEventListener("upay:payment-success", handleSuccess);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [loading, apiKey, amount, token, chain, metadata, onSuccess, onError]);

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
      style={
        className
          ? undefined
          : {
              ...defaultStyles.button,
              ...(loading ? defaultStyles.loading : {}),
            }
      }
      aria-label={loading ? "Processing payment…" : label}
      aria-busy={loading}
    >
      {loading ? <Spinner /> : <UPayLogo />}
      <span>{loading ? "Opening checkout…" : label}</span>
    </button>
  );
}
