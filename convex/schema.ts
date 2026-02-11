import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const recurrenceValidator = v.union(
  v.literal("none"),
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("monthly"),
  v.literal("yearly")
);

const formatValidator = v.union(v.literal("number"), v.literal("currency"));

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    paymentProvider: v.optional(v.string()),
    paymentCustomerId: v.optional(v.string()),
    hasPaid: v.boolean(),
    timezone: v.string(),
  }).index("by_userId", ["userId"]),

  apiTokens: defineTable({
    userId: v.id("users"),
    name: v.string(),
    hashedToken: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_hashedToken", ["hashedToken"]),

  boards: defineTable({
    userId: v.id("users"),
    name: v.string(),
    isPublic: v.boolean(),
    publicSlug: v.optional(v.string()),
    theme: v.string(),
    sortOrder: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_sortOrder", ["userId", "sortOrder"])
    .index("by_publicSlug", ["publicSlug"]),

  goals: defineTable({
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
    .index("by_boardId_sortOrder", ["boardId", "sortOrder"])
    .index("by_userId", ["userId"])
    .index("by_embedId", ["embedId"]),

  records: defineTable({
    goalId: v.id("goals"),
    userId: v.id("users"),
    amount: v.number(),
    description: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_goalId_timestamp", ["goalId", "timestamp"]),

  payments: defineTable({
    email: v.string(),
    stripeCustomerId: v.optional(v.string()),
    paymentProvider: v.string(),
    completedAt: v.number(),
  }).index("by_email", ["email"]),

  magicLinks: defineTable({
    email: v.string(),
    url: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  liveVisitors: defineTable({
    ipAddress: v.string(),
    lastSeen: v.number(),
  })
    .index("by_ipAddress", ["ipAddress"])
    .index("by_lastSeen", ["lastSeen"]),
});
