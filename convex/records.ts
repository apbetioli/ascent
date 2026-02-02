import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const listRecordsByGoal = query({
  args: { goalId: v.id("goals") },
  returns: v.array(
    v.object({
      _id: v.id("records"),
      _creationTime: v.number(),
      goalId: v.id("goals"),
      userId: v.id("users"),
      amount: v.number(),
      description: v.optional(v.string()),
      timestamp: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("records")
      .withIndex("by_goalId_timestamp", (q) => q.eq("goalId", args.goalId))
      .order("desc")
      .collect();
  },
});

export const getRecord = query({
  args: { recordId: v.id("records") },
  returns: v.union(
    v.object({
      _id: v.id("records"),
      _creationTime: v.number(),
      goalId: v.id("goals"),
      userId: v.id("users"),
      amount: v.number(),
      description: v.optional(v.string()),
      timestamp: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.recordId);
  },
});

export const createRecord = mutation({
  args: {
    goalId: v.id("goals"),
    userId: v.id("users"),
    amount: v.number(),
    description: v.optional(v.string()),
    timestamp: v.number(),
  },
  returns: v.id("records"),
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== args.userId) throw new Error("Goal not found");
    const recordId = await ctx.db.insert("records", {
      goalId: args.goalId,
      userId: args.userId,
      amount: args.amount,
      description: args.description?.trim() || undefined,
      timestamp: args.timestamp,
    });
    await ctx.runMutation(internal.goals.recomputeCurrentAmount, {
      goalId: args.goalId,
    });
    return recordId;
  },
});

export const updateRecord = mutation({
  args: {
    recordId: v.id("records"),
    userId: v.id("users"),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    timestamp: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId);
    if (!record || record.userId !== args.userId) return null;
    const updates: Record<string, unknown> = {};
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.description !== undefined)
      updates.description = args.description.trim() || undefined;
    if (args.timestamp !== undefined) updates.timestamp = args.timestamp;
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.recordId, updates);
      await ctx.runMutation(internal.goals.recomputeCurrentAmount, {
        goalId: record.goalId,
      });
    }
    return null;
  },
});

export const deleteRecord = mutation({
  args: { recordId: v.id("records"), userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId);
    if (!record || record.userId !== args.userId) return null;
    await ctx.db.delete(args.recordId);
    await ctx.runMutation(internal.goals.recomputeCurrentAmount, {
      goalId: record.goalId,
    });
    return null;
  },
});
