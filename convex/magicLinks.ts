import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * Store a magic link URL for an email (used when creating sign-in link server-side
 * so payment-success can redirect the user to it and log them in directly).
 */
export const storeForEmail = mutation({
  args: { email: v.string(), url: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Replace any existing magic link for this email so we always have at most one
    const existing = await ctx.db
      .query("magicLinks")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }
    await ctx.db.insert("magicLinks", {
      email: args.email,
      url: args.url,
      createdAt: Date.now(),
    });
    return null;
  },
});

/**
 * Get the stored magic link URL for an email (one-time use; call consumeForEmail after redirect).
 */
export const getForEmail = query({
  args: { email: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("magicLinks")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return row?.url ?? null;
  },
});

/**
 * Delete the stored magic link URL after it has been used (called from
 * payment-success after redirect so the URL can't be reused).
 */
export const consumeForEmail = mutation({
  args: { email: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("magicLinks")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (row) await ctx.db.delete(row._id);
    return null;
  },
});

/**
 * Create a magic link for an email and return the URL in one call.
 * Used by payment-success so the URL is visible immediately (no eventual-consistency gap).
 * Requires SITE_URL (or CONVEX_SITE_URL) set in Convex for redirectAbsoluteUrl.
 */
export const createMagicLinkForEmail = action({
  args: {
    email: v.string(),
    redirectTo: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args): Promise<string | null> => {
    await ctx.runAction(api.auth.signIn, {
      provider: "email",
      params: {
        email: args.email,
        redirectTo: args.redirectTo,
      },
    });
    const url = await ctx.runQuery(api.magicLinks.getForEmail, {
      email: args.email,
    });
    return url;
  },
});
