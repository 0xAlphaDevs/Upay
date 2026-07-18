import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { lookupUaTransaction, sameAddress } from "@/lib/particle-verify";

// Verification polls Particle until the UA transaction reaches a terminal state.
export const maxDuration = 60;

// POST /api/v1/sessions/:id/complete
// Called by checkout after ua.sendTransaction succeeds.
// Idempotent: a session can only be paid once.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { payer_address, tx_hashes, source_breakdown } = body as {
    payer_address?: string;
    tx_hashes?: string[];
    source_breakdown?: Record<string, unknown>;
  };

  if (!payer_address || !tx_hashes?.length) {
    return NextResponse.json(
      { error: "payer_address and tx_hashes are required" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  // Fetch the session
  const { data: session, error: sessionErr } = await supabase
    .from("checkout_sessions")
    .select("id, merchant_id, amount, settle_token, settle_chain, recipient, status, expires_at")
    .eq("id", params.id)
    .single();

  if (sessionErr || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status === "paid") {
    // Idempotent — return existing payment
    const { data: existing } = await supabase
      .from("payments")
      .select("*")
      .eq("session_id", params.id)
      .single();
    return NextResponse.json({ success: true, payment: existing });
  }

  if (session.status !== "pending") {
    return NextResponse.json(
      { error: `Session is ${session.status}` },
      { status: 409 }
    );
  }

  if (new Date(session.expires_at) < new Date()) {
    await supabase
      .from("checkout_sessions")
      .update({ status: "expired" })
      .eq("id", params.id);
    return NextResponse.json({ error: "Session expired" }, { status: 410 });
  }

  // Verify the payment actually happened on-chain before trusting the client's
  // claim. A UA transaction is a cross-chain bundle, so we look it up by the
  // transactionId returned from ua.sendTransaction rather than treating
  // tx_hashes[0] as a plain per-chain hash.
  const verification = await lookupUaTransaction(tx_hashes[0], payer_address);

  if (!verification.found) {
    console.error("UA verification: transaction not found", { transactionId: tx_hashes[0] });
    return NextResponse.json(
      { error: "Could not verify transaction with Particle" },
      { status: 502 }
    );
  }

  if (!sameAddress(verification.sender, payer_address)) {
    console.error("UA verification: sender mismatch", {
      claimedPayer: payer_address,
      resolvedSender: verification.sender,
    });
    return NextResponse.json(
      { error: "payer_address does not match the transaction sender" },
      { status: 400 }
    );
  }

  if (verification.receiver && !sameAddress(verification.receiver, session.recipient)) {
    console.error("UA verification: receiver mismatch", {
      sessionRecipient: session.recipient,
      resolvedReceiver: verification.receiver,
    });
    return NextResponse.json(
      { error: "Transaction recipient does not match session recipient" },
      { status: 400 }
    );
  }

  if (!verification.settled) {
    console.error("UA verification: not settled", { status: verification.status });
    return NextResponse.json(
      {
        error: verification.failed
          ? `Transaction failed (status: ${verification.status})`
          : `Transaction not confirmed yet (status: ${verification.status ?? "unknown"})`,
      },
      { status: 409 }
    );
  }

  const settledAt = new Date().toISOString();

  // Store the verified sender, not the raw client-supplied value.
  const verifiedPayerAddress = verification.sender ?? payer_address;

  // Create the payment record
  const { data: payment, error: paymentErr } = await supabase
    .from("payments")
    .insert({
      session_id: params.id,
      merchant_id: session.merchant_id,
      payer_address: verifiedPayerAddress,
      settle_token: session.settle_token,
      settle_chain: session.settle_chain,
      amount: session.amount,
      source_breakdown: (source_breakdown ?? null) as import("@/lib/database.types").Json | null,
      // Particle transactionId first, then the real per-chain tx hashes from the bundle
      tx_hashes: [...new Set([...tx_hashes, ...verification.chainTxHashes])] as import("@/lib/database.types").Json,
      status: "settled",
      settled_at: settledAt,
    })
    .select("*")
    .single();

  if (paymentErr || !payment) {
    console.error("Payment insert error:", paymentErr);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }

  // Mark session as paid
  await supabase
    .from("checkout_sessions")
    .update({ status: "paid" })
    .eq("id", params.id);

  return NextResponse.json({ success: true, payment });
}
