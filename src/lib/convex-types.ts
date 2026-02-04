import type { Id } from "convex/_generated/dataModel";

export type ConvexBoard = {
  _id: Id<"boards">;
  _creationTime: number;
  userId: Id<"users">;
  name: string;
  isPublic: boolean;
  publicSlug?: string;
  theme: string;
  sortOrder?: number;
};

export type ConvexGoal = {
  _id: Id<"goals">;
  _creationTime: number;
  boardId: Id<"boards">;
  userId: Id<"users">;
  embedId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: number;
  recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly";
  format: "number" | "currency";
  color: string;
  sortOrder: number;
};

export type ConvexRecord = {
  _id: Id<"records">;
  _creationTime: number;
  goalId: Id<"goals">;
  userId: Id<"users">;
  amount: number;
  description?: string;
  timestamp: number;
};

export type ConvexProfile = {
  _id: Id<"profiles">;
  _creationTime: number;
  userId: Id<"users">;
  name?: string;
  avatarUrl?: string;
  paymentProvider?: string;
  paymentCustomerId?: string;
  hasPaid: boolean;
  timezone: string;
};
