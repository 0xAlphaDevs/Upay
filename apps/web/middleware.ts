import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "https://tryupay.xyz",
  "https://www.tryupay.xyz",
  "https://demo.tryupay.xyz",
];

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    process.env.NEXT_PUBLIC_APP_URL === origin;

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin, isAllowed),
    });
  }

  const res = NextResponse.next();
  if (isAllowed) {
    const headers = corsHeaders(origin, true);
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
  }
  return res;
}

function corsHeaders(origin: string, allowed: boolean) {
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export const config = {
  matcher: "/api/:path*",
};
