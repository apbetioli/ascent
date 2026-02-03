import { action, internalQuery, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { internal } from "./_generated/api";

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate API Bearer token and return userId. Used by Next.js API routes.
 */
export const getUserIdForApiAuth = action({
  args: { token: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args): Promise<Id<"users"> | null> => {
    if (!args.token?.trim()) return null;
    const hashedToken = await hashToken(args.token.trim());
    const userId: Id<"users"> | null = await ctx.runQuery(
      internal.api_tokens.getUserIdByHashedToken,
      { hashedToken }
    );
    return userId;
  },
});

export const createApiToken = mutation({
  args: { userId: v.id("users"), name: v.string() },
  returns: v.object({ token: v.string(), tokenId: v.id("api_tokens") }),
  handler: async (ctx, args) => {
    const token = `gt_${crypto.randomUUID().replace(/-/g, "")}`;
    const hashedToken = await hashToken(token);
    const tokenId = await ctx.db.insert("api_tokens", {
      userId: args.userId,
      name: args.name.trim(),
      hashedToken,
    });
    return { token, tokenId };
  },
});

export const listApiTokens = query({
  args: { userId: v.id("users") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("api_tokens")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const listApiTokensLimited = query({
  args: { userId: v.id("users") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const tokens = await ctx.db
      .query("api_tokens")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return tokens.map((t) => ({
      _id: t._id,
      _creationTime: t._creationTime,
      name: t.name,
    }));
  },
});

export const deleteApiToken = mutation({
  args: { tokenId: v.id("api_tokens"), userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const token = await ctx.db.get(args.tokenId);
    if (!token || token.userId !== args.userId) return null;
    await ctx.db.delete(args.tokenId);
    return null;
  },
});

export const getUserIdByHashedToken = internalQuery({
  args: { hashedToken: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query("api_tokens")
      .withIndex("by_hashedToken", (q) => q.eq("hashedToken", args.hashedToken))
      .unique();
    return token?.userId ?? null;
  },
});
