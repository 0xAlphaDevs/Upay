import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { validateApiKey } from "@/lib/api-auth";
import { verifyMerchantJWT } from "@/lib/jwt";

// GET /api/v1/payments — list payments for the authenticated merchant.
// Accepts either a merchant API key or a merchant JWT in the Authorization header.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const apiAuth = await validateApiKey(authHeader);
  const jwtAuth = !apiAuth && authHeader?.startsWith("Bearer ")
    ? verifyMerchantJWT(authHeader.slice(7).trim())
    : null;

  const merchantId = apiAuth?.merchantId ?? jwtAuth?.merchantId ?? null;
  if (!merchantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const status = searchParams.get("status");

  const supabase = getServiceClient();

  let query = supabase
    .from("payments")
    .select("*", { count: "exact" })
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);

  const { data: payments, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }

  return NextResponse.json({ payments: payments ?? [], total: count ?? 0 });
}
