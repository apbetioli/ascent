import { NextResponse } from "next/server";

/**
 * Legacy auth callback path. Convex Auth handles OAuth and magic link
 * via /api/auth (proxied by middleware). Redirect to login if someone
 * lands here (e.g. old bookmark).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/boards";
  const origin =
    request.headers.get("origin") ??
    request.url.split("/").slice(0, 3).join("/");

  return NextResponse.redirect(
    `${origin}/login?redirect=${encodeURIComponent(next)}`
  );
}
