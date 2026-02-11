import { authenticateApiRequest, apiError } from "./auth";

interface ApiContext {
  userId: string;
  request: Request;
}

type ApiHandler = (context: ApiContext) => Promise<Response>;

interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
    ...(result.retryAfter && !result.ok
      ? { "Retry-After": Math.ceil((result.retryAfter - Date.now()) / 1000).toString() }
      : {}),
  };
}

async function checkConvexApiRateLimit(
  userId: string
): Promise<RateLimitResult> {
  const convexSiteUrl =
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
    (process.env.NEXT_PUBLIC_CONVEX_URL?.replace(".convex.cloud", ".convex.site"));
  if (!convexSiteUrl) {
    return { ok: true, limit: 100, remaining: 99, reset: Date.now() + 3600000 };
  }
  try {
    const res = await fetch(`${convexSiteUrl}/checkApiRateLimit`, {
      method: "POST",
      headers: { "X-RateLimit-User": userId },
    });
    if (!res.ok) {
      return { ok: true, limit: 100, remaining: 99, reset: Date.now() + 3600000 };
    }
    return (await res.json()) as RateLimitResult;
  } catch {
    return { ok: true, limit: 100, remaining: 99, reset: Date.now() + 3600000 };
  }
}

/**
 * Wrapper for API routes that handles authentication and rate limiting
 */
export function withApiAuth(handler: ApiHandler) {
  return async (request: Request): Promise<Response> => {
    const userId = await authenticateApiRequest(request);

    if (!userId) {
      return apiError("Unauthorized. Please provide a valid API token.", 401);
    }

    const rateLimitResult = await checkConvexApiRateLimit(userId);
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.ok) {
      return apiError(
        "Rate limit exceeded. Please try again later.",
        429,
        rateLimitHeaders
      );
    }

    try {
      const response = await handler({ userId, request });

      const headers = new Headers(response.headers);
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      console.error("API Error:", error);
      return apiError("Internal server error", 500, rateLimitHeaders);
    }
  };
}
