// Script-tag embed: <script src="…/sdk.js" defer></script>
// <div data-upay-button data-key="pk_live_…" data-amount="40" data-token="USDC" data-chain="base"></div>
import { UPay } from "./client";

function mount(el: HTMLElement): void {
  const key = el.dataset.key ?? "";
  const amount = el.dataset.amount ?? "0";
  const token = el.dataset.token ?? "USDC";
  const chain = el.dataset.chain ?? "base";
  const label = el.dataset.label ?? "Pay with UPay";

  const btn = document.createElement("button");
  btn.textContent = label;
  btn.style.cssText = [
    "display:inline-flex",
    "align-items:center",
    "gap:8px",
    "padding:12px 24px",
    "background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
    "color:#fff",
    "border:none",
    "border-radius:10px",
    "font-size:15px",
    "font-weight:600",
    "cursor:pointer",
    "min-height:44px",
  ].join(";");

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Opening checkout…";
    try {
      const client = new UPay({ apiKey: key });
      const session = await client.createCheckout({ amount, token, chain });
      client.openCheckout(session.id);
    } catch {
      btn.textContent = "Error — try again";
    } finally {
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = label;
      }, 2000);
    }
  });

  el.appendChild(btn);
}

if (typeof document !== "undefined") {
  const init = () => {
    document
      .querySelectorAll<HTMLElement>("[data-upay-button]")
      .forEach(mount);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
