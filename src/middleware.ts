import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import {
  authRateLimiter,
  checkRateLimit,
  getRateLimitHeaders,
} from "./lib/redis/rate-limit";
import { addVisitor } from "./lib/redis/visitors";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // x-forwarded-for & x-real-ip: Only trust in production when behind a trusted proxy
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  // Track visitors on marketing/landing page
  if (pathname === "/") {
    await addVisitor(ip);
  }

  // Skip rate limiting for the blocked page to prevent redirect loops
  if (pathname === "/blocked") {
    return await updateSession(request);
  }

  const isLocalhost = ip === "127.0.0.1" || ip === "::1" || ip === "localhost";
  // Skip rate limiting for localhost/development
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
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
