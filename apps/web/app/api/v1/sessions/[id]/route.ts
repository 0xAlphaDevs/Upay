import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// GET /api/v1/sessions/:id — public read for the checkout page
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient();

  const { data: session, error } = await supabase
    .from("checkout_sessions")
    .select(
      "id, amount, settle_token, settle_chain, recipient, status, expires_at, metadata, success_url, cancel_url"
    )
    .eq("id", params.id)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Auto-expire sessions past their expiry time
  if (session.status === "pending" && new Date(session.expires_at) < new Date()) {
    await supabase
      .from("checkout_sessions")
      .update({ status: "expired" })
      .eq("id", params.id);
    return NextResponse.json({ ...session, status: "expired" });
  }

  return NextResponse.json(session);
}
