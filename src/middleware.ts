import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import {
  authRateLimiter,
  checkRateLimit,
  getRateLimitHeaders,
} from "./lib/rate-limit";

export async function middleware(request: NextRequest) {
  // Skip rate limiting for the blocked page to prevent redirect loops
  if (request.nextUrl.pathname === "/blocked") {
    return await updateSession(request);
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Skip rate limiting for localhost/development
  const isLocalhost = ip === "127.0.0.1" || ip === "::1" || ip === "localhost";
  if (!isLocalhost) {
    const rateLimitResult = await checkRateLimit(authRateLimiter, ip);
    const { success } = getRateLimitHeaders(rateLimitResult);

    if (!success) {
      return NextResponse.redirect(new URL("/blocked", request.url));
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
