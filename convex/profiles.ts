import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericQueryCtx } from "convex/server";
import { mutation, query } from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";
import { v } from "convex/values";

const profileDocValidator = v.object({
  _id: v.id("profiles"),
  _creationTime: v.number(),
  userId: v.id("users"),
  name: v.optional(v.string()),
  avatarUrl: v.optional(v.string()),
  paymentProvider: v.optional(v.string()),
  paymentCustomerId: v.optional(v.string()),
  hasPaid: v.boolean(),
  timezone: v.string(),
});

export const getCurrentUserId = query({
  args: {},
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx) => {
    return await getAuthUserId(ctx as GenericQueryCtx<DataModel>);
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
    const userId = await getAuthUserId(ctx as GenericQueryCtx<DataModel>);
    if (!userId) return null;
    const user = await ctx.db.get("users", userId);
    if (!user) return null;
    return { userId, email: user.email, name: user.name };
  },
});

export const getProfile = query({
  args: { userId: v.id("users") },
  returns: v.union(profileDocValidator, v.null()),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    return profile;
  },
});

/** Current user's profile + userId and email for nav. Uses auth context. */
export const getCurrentProfile = query({
  args: {},
  returns: v.union(
    v.object({
      profile: v.union(profileDocValidator, v.null()),
      userId: v.id("users"),
      email: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx as GenericQueryCtx<DataModel>);
    if (!userId) return null;
    const user = await ctx.db.get("users", userId);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    return { profile, userId, email: user?.email };
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

/**
 * Set hasPaid (and payment fields) for an existing profile by email.
 * Called from payment-success route after Stripe verification. No-op if no user/profile for email.
 */
export const setHasPaidByEmail = mutation({
  args: {
    email: v.string(),
    paymentProvider: v.string(),
    stripeCustomerId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    if (!user) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) return null;
    await ctx.db.patch(profile._id, {
      hasPaid: true,
      paymentProvider: args.paymentProvider,
      ...(args.stripeCustomerId != null && {
        paymentCustomerId: args.stripeCustomerId,
      }),
    });
    return null;
  },
});

export const ensureProfileAndDefaultBoard = mutation({
  args: {
    userId: v.optional(v.id("users")),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId =
      args.userId ?? (await getAuthUserId(ctx as GenericQueryCtx<DataModel>));
    if (!userId) return null;
    const user = await ctx.db.get("users", userId);
    const email = args.email ?? user?.email;
    const name = args.name ?? user?.name;
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!existing) {
      const pending = email
        ? await ctx.db
            .query("payments")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first()
        : null;
      await ctx.db.insert("profiles", {
        userId,
        name,
        avatarUrl: args.image,
        hasPaid: !!pending,
        timezone: "UTC",
        ...(pending && {
          paymentProvider: pending.paymentProvider,
          ...(pending.stripeCustomerId != null && {
            paymentCustomerId: pending.stripeCustomerId,
          }),
        }),
      });
      const boards = await ctx.db
        .query("boards")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
      if (boards.length === 0) {
        await ctx.db.insert("boards", {
          userId,
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
