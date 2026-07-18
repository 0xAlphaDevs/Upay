import type {
  UPayClientOptions,
  CreateCheckoutOptions,
  UPayCheckoutSession,
} from "./types";

const DEFAULT_BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000";

export class UPay {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: UPayClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  }

  async createCheckout(
    options: CreateCheckoutOptions
  ): Promise<UPayCheckoutSession> {
    const res = await fetch(`${this.baseUrl}/api/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        amount: options.amount,
        token: options.token,
        chain: options.chain,
        metadata: options.metadata,
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }

    return res.json();
  }

  openCheckout(sessionId: string): void {
    const url = `${this.baseUrl}/checkout/${sessionId}`;

    if (typeof window === "undefined") return;

    const existingModal = document.getElementById("upay-modal-container");
    if (existingModal) existingModal.remove();

    const container = document.createElement("div");
    container.id = "upay-modal-container";
    container.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:2147483647",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "background:rgba(0,0,0,0.6)",
      "backdrop-filter:blur(4px)",
    ].join(";");

    // Spinner shown while iframe loads
    const spinner = document.createElement("div");
    spinner.style.cssText = [
      "width:min(480px,100vw)",
      "height:min(700px,100vh)",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "border-radius:16px",
      "background:#fff",
    ].join(";");
    spinner.innerHTML = `
      <style>@keyframes upay-modal-spin{to{transform:rotate(360deg)}}</style>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
        style="animation:upay-modal-spin 0.8s linear infinite">
        <circle cx="18" cy="18" r="14" stroke="#e5e7eb" stroke-width="3"/>
        <path d="M18 4a14 14 0 0 1 14 14" stroke="#6366f1"
          stroke-width="3" stroke-linecap="round"/>
      </svg>`;

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.cssText = [
      "display:none",
      "width:min(480px,100vw)",
      "height:0",
      "max-height:90vh",
      "border:none",
      "border-radius:16px",
      "box-shadow:0 25px 50px rgba(0,0,0,0.4)",
      "transition:height 0.2s ease",
      "overflow:hidden",
    ].join(";");
    iframe.allow = "payment";
    iframe.onload = () => {
      spinner.remove();
      iframe.style.display = "block";
    };

    const close = (): void => container.remove();

    container.addEventListener("click", (e) => {
      if (e.target === container) close();
    });

    window.addEventListener(
      "message",
      (e) => {
        if (e.data?.type === "upay:close") close();
        if (e.data?.type === "upay:height") {
          const maxPx = window.innerHeight * 0.9;
          iframe.style.height = `${Math.min(e.data.height, maxPx)}px`;
        }
        if (e.data?.type === "upay:success") {
          close();
          window.dispatchEvent(
            new CustomEvent("upay:payment-success", { detail: e.data.payment })
          );
        }
      },
      { once: false }
    );

    container.appendChild(spinner);
    container.appendChild(iframe);
    document.body.appendChild(container);
  }
}
