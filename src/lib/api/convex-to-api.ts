/**
 * Map Convex document shapes to REST API response shape (snake_case, id).
 * Used by /api/v1/* routes to preserve API contract.
 */

import type { Id } from "convex/_generated/dataModel";

type ConvexGoal = {
  _id: Id<"goals">;
  _creationTime: number;
  boardId: Id<"boards">;
  userId: Id<"users">;
  embedId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: number;
  recurrence: string;
  format: string;
  color: string;
  sortOrder: number;
};

type ConvexRecord = {
  _id: Id<"records">;
  _creationTime: number;
  goalId: Id<"goals">;
  userId: Id<"users">;
  amount: number;
  description?: string;
  timestamp: number;
};

export function convexGoalToApi(goal: ConvexGoal) {
  return {
    id: goal._id,
    embed_id: goal.embedId,
    board_id: goal.boardId,
    user_id: goal.userId,
    name: goal.name,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    deadline: goal.deadline ?? null,
    recurrence: goal.recurrence,
    format: goal.format,
    color: goal.color,
    sort_order: goal.sortOrder,
    created_at: new Date(goal._creationTime).toISOString(),
  };
}

export function convexRecordToApi(record: ConvexRecord) {
  return {
    id: record._id,
    goal_id: record.goalId,
    user_id: record.userId,
    amount: record.amount,
    description: record.description ?? null,
    timestamp: record.timestamp,
  };
}
