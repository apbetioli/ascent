import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Auth/middleware: 10 requests per minute per IP (matches previous Redis config)
  auth: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 10 },
  // API: 100 requests per hour per user (matches previous Redis config)
  api: { kind: "fixed window", rate: 100, period: HOUR },
});

/**
 * Check auth rate limit (IP-based). Used by Next.js middleware.
 * Returns { ok, retryAfter } - ok is false when rate limited.
 */
export const checkAuthRateLimit = internalMutation({
  args: { ip: v.string() },
  returns: v.object({
    ok: v.boolean(),
    retryAfter: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    const status = await rateLimiter.limit(ctx, "auth", { key: args.ip });
    return {
      ok: status.ok,
      retryAfter: status.retryAfter ?? undefined,
    };
  },
});

/**
 * Check API rate limit (user-based). Used by withApiAuth.
 * Returns { ok, retryAfter, limit, remaining, reset } for X-RateLimit headers.
 */
export const checkApiRateLimit = internalMutation({
  args: { userId: v.string() },
  returns: v.object({
    ok: v.boolean(),
    retryAfter: v.optional(v.number()),
    limit: v.number(),
    remaining: v.number(),
    reset: v.number(),
  }),
  handler: async (ctx, args) => {
    const status = await rateLimiter.limit(ctx, "api", { key: args.userId });
    const limit = 100; // matches api rate limit config
    const reset =
      status.retryAfter ?? Math.ceil(Date.now() / HOUR) * HOUR + HOUR;
    const remaining = status.ok ? Math.max(0, limit - 1) : 0; // approximate
    return {
      ok: status.ok,
      retryAfter: status.retryAfter ?? undefined,
      limit,
      remaining,
      reset,
    };
  },
});
