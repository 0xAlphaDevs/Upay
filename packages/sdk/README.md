# @alphadevs_labs/upay-sdk

The official SDK for [UPay](https://tryupay.xyz) — a Stripe-style crypto checkout. Drop a Pay button on any website and let customers pay with whatever tokens they hold, on whatever chain, in one tap. You receive your chosen stablecoin on your chosen chain, powered by [Particle Network Universal Accounts](https://particle.network).

## Install

```bash
npm install @alphadevs_labs/upay-sdk
# or
pnpm add @alphadevs_labs/upay-sdk
# or
yarn add @alphadevs_labs/upay-sdk
```

Requires React ≥ 18 (only needed if you use `UPayButton`; the imperative `UPay` client has no React dependency).

## Quick start — React

```tsx
import { UPayButton } from "@alphadevs_labs/upay-sdk";

export function CheckoutButton() {
  return (
    <UPayButton
      apiKey="pk_live_..."
      amount="40"
      token="USDC"
      chain="base"
      onSuccess={(payment) => console.log("Paid!", payment.txHashes)}
      onError={(err) => console.error(err)}
    />
  );
}
```

Clicking the button creates a checkout session against your UPay account and opens it in an embedded modal. On success, `onSuccess` fires with the completed payment.

## Quick start — imperative client

Use `UPay` directly if you're not in React, or want full control over the checkout flow:

```ts
import { UPay } from "@alphadevs_labs/upay-sdk";

const upay = new UPay({ apiKey: "pk_live_..." });

const session = await upay.createCheckout({
  amount: "40",
  token: "USDC",
  chain: "base",
});

upay.openCheckout(session.id);
```

## Quick start — script tag (no build step)

```html
<script src="https://tryupay.xyz/sdk.js" defer></script>

<div
  data-upay-button
  data-key="pk_live_..."
  data-amount="40"
  data-token="USDC"
  data-chain="base"
></div>
```

The script scans the page for `[data-upay-button]` elements on load and mounts a working Pay button into each one.

## API reference

### `<UPayButton />`

| Prop | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | ✅ | Your publishable key (`pk_live_...`), safe to expose client-side. |
| `amount` | `string` | ✅ | Amount to charge, in the settlement token's units. |
| `baseUrl` | `string` | | Override the UPay API/checkout host. Defaults to the current origin. |
| `token` | `string` | | Settlement token override (e.g. `"USDC"`). |
| `chain` | `string` | | Settlement chain override (e.g. `"base"`). |
| `metadata` | `Record<string, unknown>` | | Arbitrary metadata attached to the session (order id, product id, etc.). |
| `label` | `string` | | Button text. Defaults to `"Pay with UPay"`. |
| `className` | `string` | | Use your own styles instead of the built-in gradient button. |
| `onSuccess` | `(payment: UPayPayment) => void` | | Called once the payment is confirmed. |
| `onError` | `(err: Error) => void` | | Called if session creation or checkout fails. |

### `new UPay(options)`

| Option | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | ✅ | Your publishable key. |
| `baseUrl` | `string` | | Override the UPay API/checkout host. |

**`upay.createCheckout(options)`** → `Promise<UPayCheckoutSession>`

| Option | Type | Required |
|---|---|---|
| `amount` | `string` | ✅ |
| `token` | `string` | |
| `chain` | `string` | |
| `metadata` | `Record<string, unknown>` | |
| `successUrl` | `string` | |
| `cancelUrl` | `string` | |

**`upay.openCheckout(sessionId)`** — mounts an embedded checkout modal (iframe) for the given session and handles close/resize/success messaging automatically.

## Types

```ts
import type {
  UPayButtonProps,
  UPayPayment,
  UPayCheckoutSession,
  UPayClientOptions,
  CreateCheckoutOptions,
} from "@alphadevs_labs/upay-sdk";
```

## Getting API keys

Sign up and create a merchant account at [tryupay.xyz/dashboard](https://tryupay.xyz/dashboard) to get your publishable (`pk_live_...`) and secret (`sk_live_...`) keys. Only the publishable key is used by this SDK — never expose your secret key client-side.

## License

MIT
