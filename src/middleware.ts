import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import type { NextFetchEvent } from "next/server";
import { NextResponse, type NextRequest } from "next/server";

const isSignInPage = createRouteMatcher(["/login"]);
const isProtectedRoute = createRouteMatcher(["/(boards|settings|api)(.*)"]);
const isPublicRoute = createRouteMatcher(["/public"]);
const isCheckoutApi = (req: NextRequest) =>
  req.nextUrl.pathname === "/api/checkout";
const isEmbedRoute = createRouteMatcher(["/embed"]);
const isBlockedRoute = createRouteMatcher(["/blocked"]);

const authMiddleware = convexAuthNextjsMiddleware(
  async (request: NextRequest, { convexAuth }) => {
    if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/boards");
    }
    if (
      isProtectedRoute(request) &&
      !isCheckoutApi(request) &&
      !(await convexAuth.isAuthenticated())
    ) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
    return NextResponse.next({ request });
  }
);

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const ip = getIp(request);

  if (!isLocalhost(request) && !isBlockedRoute(request)) {
    const redirect = await checkAuthRateLimit(ip, request);
    if (redirect) return redirect;
  }

  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (siteUrl) {
    fetch(`${siteUrl}/recordVisit`, {
      method: "POST",
      headers: { "X-Forwarded-For": ip },
    }).catch(() => {});
  }

  if (isPublicRoute(request)) {
    return NextResponse.next({ request });
  }

  if (isEmbedRoute(request)) {
    const response = NextResponse.next({ request });
    response.headers.delete("X-Frame-Options");
    return response;
  }

  return authMiddleware(request, event);
}

async function checkAuthRateLimit(
  ip: string,
  request: NextRequest
): Promise<NextResponse | null> {
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!convexSiteUrl) return null;
  try {
    const res = await fetch(`${convexSiteUrl}/checkAuthRateLimit`, {
      method: "POST",
      headers: { "X-Forwarded-For": ip, "X-RateLimit-IP": ip },
    });
    if (res.ok) {
      const { ok } = (await res.json()) as { ok: boolean };
      if (!ok) return nextjsMiddlewareRedirect(request, "/blocked");
    }
  } catch {
    // Fail open for availability
  }
  return null;
}

function getIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

function isLocalhost(request: NextRequest) {
  const ip = getIp(request);
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    request.nextUrl.hostname === "localhost"
  );
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
