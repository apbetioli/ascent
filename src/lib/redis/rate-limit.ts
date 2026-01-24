import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Rate limiter for public API: 100 requests per hour
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 h"),
      analytics: true,
      prefix: "ratelimit:api",
    })
  : null;

// Rate limiter for auth endpoints: 10 requests per minute
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null;

// Helper to check rate limit and return appropriate response
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // If no limiter (missing env vars), allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 3600000,
    };
  }
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  return { success, limit, remaining, reset };
}

// Helper to get rate limit headers for response
export function getRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}
