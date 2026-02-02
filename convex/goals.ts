import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const recurrenceValidator = v.union(
  v.literal("none"),
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("monthly"),
  v.literal("yearly")
);
const formatValidator = v.union(v.literal("number"), v.literal("currency"));

export const listGoalsByUser = query({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("goals"),
      _creationTime: v.number(),
      boardId: v.id("boards"),
      userId: v.id("users"),
      embedId: v.string(),
      name: v.string(),
      targetAmount: v.number(),
      currentAmount: v.number(),
      deadline: v.optional(v.number()),
      recurrence: recurrenceValidator,
      format: formatValidator,
      color: v.string(),
      sortOrder: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("goals")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const listGoalsByBoard = query({
  args: { boardId: v.id("boards") },
  returns: v.array(
    v.object({
      _id: v.id("goals"),
      _creationTime: v.number(),
      boardId: v.id("boards"),
      userId: v.id("users"),
      embedId: v.string(),
      name: v.string(),
      targetAmount: v.number(),
      currentAmount: v.number(),
      deadline: v.optional(v.number()),
      recurrence: recurrenceValidator,
      format: formatValidator,
      color: v.string(),
      sortOrder: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("goals")
      .withIndex("by_boardId_sortOrder", (q) => q.eq("boardId", args.boardId))
      .order("asc")
      .collect();
  },
});

export const getGoal = query({
  args: { goalId: v.id("goals"), userId: v.optional(v.id("users")) },
  returns: v.union(
    v.object({
      _id: v.id("goals"),
      _creationTime: v.number(),
      boardId: v.id("boards"),
      userId: v.id("users"),
      embedId: v.string(),
      name: v.string(),
      targetAmount: v.number(),
      currentAmount: v.number(),
      deadline: v.optional(v.number()),
      recurrence: recurrenceValidator,
      format: formatValidator,
      color: v.string(),
      sortOrder: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal) return null;
    if (args.userId !== undefined && goal.userId !== args.userId) return null;
    return goal;
  },
});

export const getGoalByEmbedId = query({
  args: { embedId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("goals"),
      _creationTime: v.number(),
      boardId: v.id("boards"),
      userId: v.id("users"),
      embedId: v.string(),
      name: v.string(),
      targetAmount: v.number(),
      currentAmount: v.number(),
      deadline: v.optional(v.number()),
      recurrence: recurrenceValidator,
      format: formatValidator,
      color: v.string(),
      sortOrder: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("goals")
      .withIndex("by_embedId", (q) => q.eq("embedId", args.embedId))
      .unique();
  },
});

export const getGoalByEmbedIdWithBoard = query({
  args: { embedId: v.string() },
  returns: v.union(
    v.object({
      goal: v.object({
        _id: v.id("goals"),
        _creationTime: v.number(),
        boardId: v.id("boards"),
        userId: v.id("users"),
        embedId: v.string(),
        name: v.string(),
        targetAmount: v.number(),
        currentAmount: v.number(),
        deadline: v.optional(v.number()),
        recurrence: recurrenceValidator,
        format: formatValidator,
        color: v.string(),
        sortOrder: v.number(),
      }),
      board: v.object({
        _id: v.id("boards"),
        isPublic: v.boolean(),
        publicSlug: v.optional(v.string()),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const goal = await ctx.db
      .query("goals")
      .withIndex("by_embedId", (q) => q.eq("embedId", args.embedId))
      .unique();
    if (!goal) return null;
    const board = await ctx.db.get(goal.boardId);
    if (!board) return null;
    return {
      goal,
      board: {
        _id: board._id,
        isPublic: board.isPublic,
        publicSlug: board.publicSlug,
      },
    };
  },
});

export const createGoal = mutation({
  args: {
    boardId: v.id("boards"),
    userId: v.id("users"),
    name: v.string(),
    targetAmount: v.number(),
    deadline: v.optional(v.number()),
    recurrence: v.optional(recurrenceValidator),
    format: v.optional(formatValidator),
    color: v.string(),
    sortOrder: v.number(),
  },
  returns: v.id("goals"),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board || board.userId !== args.userId)
      throw new Error("Board not found");
    return await ctx.db.insert("goals", {
      boardId: args.boardId,
      userId: args.userId,
      embedId: crypto.randomUUID(),
      name: args.name.trim(),
      targetAmount: args.targetAmount,
      currentAmount: 0,
      deadline: args.deadline ?? undefined,
      recurrence: args.recurrence ?? "none",
      format: args.format ?? "number",
      color: args.color,
      sortOrder: args.sortOrder,
    });
  },
});

export const updateGoal = mutation({
  args: {
    goalId: v.id("goals"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
    deadline: v.optional(v.number()),
    recurrence: v.optional(recurrenceValidator),
    format: v.optional(formatValidator),
    color: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    boardId: v.optional(v.id("boards")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== args.userId) return null;
    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.targetAmount !== undefined)
      updates.targetAmount = args.targetAmount;
    if (args.deadline !== undefined) updates.deadline = args.deadline;
    if (args.recurrence !== undefined) updates.recurrence = args.recurrence;
    if (args.format !== undefined) updates.format = args.format;
    if (args.color !== undefined) updates.color = args.color;
    if (args.sortOrder !== undefined) updates.sortOrder = args.sortOrder;
    if (args.boardId !== undefined) updates.boardId = args.boardId;
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.goalId, updates);
    }
    return null;
  },
});

export const deleteGoal = mutation({
  args: { goalId: v.id("goals"), userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== args.userId) return null;
    const records = await ctx.db
      .query("records")
      .withIndex("by_goalId_timestamp", (q) => q.eq("goalId", args.goalId))
      .collect();
    for (const rec of records) await ctx.db.delete(rec._id);
    await ctx.db.delete(args.goalId);
    return null;
  },
});

export const recomputeCurrentAmount = internalMutation({
  args: { goalId: v.id("goals") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("records")
      .withIndex("by_goalId_timestamp", (q) => q.eq("goalId", args.goalId))
      .collect();
    const sum = records.reduce((s, r) => s + r.amount, 0);
    await ctx.db.patch(args.goalId, { currentAmount: sum });
    return null;
  },
});
