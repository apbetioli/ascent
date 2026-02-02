import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listBoards = query({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("boards"),
      _creationTime: v.number(),
      userId: v.id("users"),
      name: v.string(),
      isPublic: v.boolean(),
      publicSlug: v.optional(v.string()),
      theme: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("boards")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

export const getBoard = query({
  args: { boardId: v.id("boards"), userId: v.optional(v.id("users")) },
  returns: v.union(
    v.object({
      _id: v.id("boards"),
      _creationTime: v.number(),
      userId: v.id("users"),
      name: v.string(),
      isPublic: v.boolean(),
      publicSlug: v.optional(v.string()),
      theme: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board) return null;
    if (args.userId !== undefined && board.userId !== args.userId) return null;
    return board;
  },
});

export const getBoardByPublicSlug = query({
  args: { publicSlug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("boards"),
      _creationTime: v.number(),
      userId: v.id("users"),
      name: v.string(),
      isPublic: v.boolean(),
      publicSlug: v.optional(v.string()),
      theme: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const board = await ctx.db
      .query("boards")
      .withIndex("by_publicSlug", (q) => q.eq("publicSlug", args.publicSlug))
      .unique();
    if (!board || !board.isPublic) return null;
    return board;
  },
});

export const createBoard = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    theme: v.optional(v.string()),
  },
  returns: v.id("boards"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("boards", {
      userId: args.userId,
      name: args.name.trim(),
      isPublic: false,
      theme: args.theme ?? "default",
    });
  },
});

export const updateBoard = mutation({
  args: {
    boardId: v.id("boards"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board || board.userId !== args.userId) return null;
    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name.trim();
    if (args.isPublic !== undefined) {
      updates.isPublic = args.isPublic;
      if (args.isPublic && !board.publicSlug) {
        updates.publicSlug = crypto.randomUUID();
      }
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.boardId, updates);
    }
    return null;
  },
});

export const deleteBoard = mutation({
  args: { boardId: v.id("boards"), userId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board || board.userId !== args.userId) return null;
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_boardId_sortOrder", (q) => q.eq("boardId", args.boardId))
      .collect();
    for (const goal of goals) {
      const records = await ctx.db
        .query("records")
        .withIndex("by_goalId_timestamp", (q) => q.eq("goalId", goal._id))
        .collect();
      for (const rec of records) await ctx.db.delete(rec._id);
      await ctx.db.delete(goal._id);
    }
    await ctx.db.delete(args.boardId);
    return null;
  },
});
