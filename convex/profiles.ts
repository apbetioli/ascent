import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUserId = query({
  args: {},
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx) => {
    return await getAuthUserId(ctx as any);
  },
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      userId: v.id("users"),
      email: v.optional(v.string()),
      name: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx as any);
    if (!userId) return null;
    const user = await ctx.db.get("users", userId);
    if (!user) return null;
    return { userId, email: user.email, name: user.name };
  },
});

export const getProfile = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("profiles"),
      _creationTime: v.number(),
      userId: v.id("users"),
      name: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      paymentProvider: v.optional(v.string()),
      paymentCustomerId: v.optional(v.string()),
      hasPaid: v.boolean(),
      timezone: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    return profile;
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    timezone: v.optional(v.string()),
    hasPaid: v.optional(v.boolean()),
    paymentProvider: v.optional(v.string()),
    paymentCustomerId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.avatarUrl !== undefined) patch.avatarUrl = updates.avatarUrl;
    if (updates.timezone !== undefined) patch.timezone = updates.timezone;
    if (updates.hasPaid !== undefined) patch.hasPaid = updates.hasPaid;
    if (updates.paymentProvider !== undefined)
      patch.paymentProvider = updates.paymentProvider;
    if (updates.paymentCustomerId !== undefined)
      patch.paymentCustomerId = updates.paymentCustomerId;
    await ctx.db.patch(profile._id, patch);
    return null;
  },
});

export const ensureProfileAndDefaultBoard = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!existing) {
      const pending = args.email
        ? await ctx.db
            .query("pending_payments")
            .withIndex("by_email", (q) => q.eq("email", args.email!))
            .first()
        : null;
      await ctx.db.insert("profiles", {
        userId: args.userId,
        name: args.name,
        avatarUrl: args.image,
        hasPaid: !!pending,
        timezone: "UTC",
        ...(pending && {
          paymentProvider: pending.paymentProvider,
          paymentCustomerId: pending.stripeCustomerId,
        }),
      });
      const boards = await ctx.db
        .query("boards")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();
      if (boards.length === 0) {
        await ctx.db.insert("boards", {
          userId: args.userId,
          name: "My Goals",
          isPublic: false,
          theme: "default",
        });
      }
      if (pending) {
        await ctx.db.delete(pending._id);
      }
    }
    return null;
  },
});
