import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addPendingPayment = mutation({
  args: {
    email: v.string(),
    stripeCustomerId: v.optional(v.string()),
    paymentProvider: v.string(),
  },
  returns: v.id("pending_payments"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("pending_payments", {
      email: args.email,
      ...(args.stripeCustomerId != null && {
        stripeCustomerId: args.stripeCustomerId,
      }),
      paymentProvider: args.paymentProvider,
      completedAt: Date.now(),
    });
  },
});

export const getAndConsumePendingPaymentByEmail = mutation({
  args: { email: v.string() },
  returns: v.union(
    v.object({
      stripeCustomerId: v.optional(v.string()),
      paymentProvider: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const pending = await ctx.db
      .query("pending_payments")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (!pending) return null;
    const result = {
      stripeCustomerId: pending.stripeCustomerId,
      paymentProvider: pending.paymentProvider,
    };
    await ctx.db.delete(pending._id);
    return result;
  },
});
