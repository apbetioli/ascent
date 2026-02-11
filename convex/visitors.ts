import {
  internalMutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";

const LIVE_WINDOW_MS = 60 * 1000; // 60 seconds, same as Redis TTL

/**
 * Record a visit from an IP. Upserts by IP so we keep one row per visitor
 * with an updated lastSeen (same semantics as Redis SADD + EXPIRE on the set).
 */
export const recordVisit = internalMutation({
  args: { ipAddress: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("liveVisitors")
      .withIndex("by_ipAddress", (q) => q.eq("ipAddress", args.ipAddress))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: now });
    } else {
      await ctx.db.insert("liveVisitors", {
        ipAddress: args.ipAddress,
        lastSeen: now,
      });
    }
    return null;
  },
});

/**
 * Count unique visitors seen in the last 60 seconds (matches Redis live set).
 */
export const getLiveCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const cutoff = Date.now() - LIVE_WINDOW_MS;
    const docs = await ctx.db
      .query("liveVisitors")
      .withIndex("by_lastSeen", (q) => q.gte("lastSeen", cutoff))
      .collect();
    return docs.length;
  },
});

/**
 * Delete visitor rows older than the live window so the table doesn't grow forever.
 * Called by cron.
 */
export const cleanStaleVisitors = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const cutoff = Date.now() - LIVE_WINDOW_MS;
    const stale = await ctx.db
      .query("liveVisitors")
      .withIndex("by_lastSeen", (q) => q.lt("lastSeen", cutoff))
      .collect();
    for (const doc of stale) {
      await ctx.db.delete(doc._id);
    }
    return null;
  },
});
