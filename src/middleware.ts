import {
  convexAuthNextjsMiddleware,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import type { NextFetchEvent } from "next/server";
import { NextResponse, type NextRequest } from "next/server";
import {
  authRateLimiter,
  checkRateLimit,
  getRateLimitHeaders,
} from "./lib/redis/rate-limit";
import { addVisitor } from "./lib/redis/visitors";

const authMiddleware = convexAuthNextjsMiddleware(
  async (request: NextRequest, { convexAuth }) => {
    const pathname = request.nextUrl.pathname;
    const isPublicRoute =
      pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/auth/");

    if (!(await convexAuth.isAuthenticated()) && !isPublicRoute) {
      return nextjsMiddlewareRedirect(request, "/login");
    }

    return NextResponse.next({ request });
  }
);

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;
  const ip = getIp(request);

  addVisitor(ip);

  if (
    !isLocalhost(ip) &&
    !isLocalhost(request.nextUrl.hostname) &&
    pathname !== "/blocked"
  ) {
    const rateLimitResult = await checkRateLimit(authRateLimiter, ip);
    const { success } = getRateLimitHeaders(rateLimitResult);
    if (!success) {
      return NextResponse.redirect(new URL("/blocked", request.url));
    }
  }

  if (pathname.startsWith("/public/")) {
    return NextResponse.next({ request });
  }

  if (pathname.startsWith("/embed/")) {
    const response = NextResponse.next({ request });
    response.headers.delete("X-Frame-Options");
    return response;
  }

  return authMiddleware(request, event);
}

function getIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

function isLocalhost(ip: string) {
  return ip === "127.0.0.1" || ip === "::1" || ip === "localhost";
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
