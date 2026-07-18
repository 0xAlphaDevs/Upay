import { Suspense } from "react";
import { CheckoutClient } from "./CheckoutClient";

export default function CheckoutPage({
  params,
}: {
  params: { sessionId: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-upay-purple" />
        </div>
      }
    >
      <CheckoutClient sessionId={params.sessionId} />
    </Suspense>
  );
}
