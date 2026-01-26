import { GOAL_COLORS, type GoalColor } from "@/lib/utils/colors";
import { z } from "zod";

// Board schemas
export const createBoardSchema = z.object({
  name: z
    .string()
    .min(1, "Board name is required")
    .max(100, "Board name is too long"),
});

export const updateBoardSchema = z.object({
  name: z
    .string()
    .min(1, "Board name is required")
    .max(100, "Board name is too long")
    .optional(),
  is_public: z.boolean().optional(),
  theme: z.string().optional(),
});

// Goal schemas
export const recurrenceSchema = z.enum([
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

export const createGoalSchema = z.object({
  board_id: z.string().uuid("Invalid board ID"),
  name: z
    .string()
    .min(1, "Goal name is required")
    .max(200, "Goal name is too long"),
  target_amount: z.number().positive("Target amount must be positive"),
  initial_amount: z
    .number()
    .min(0, "Initial amount cannot be negative")
    .optional(),
  deadline: z.number().int().positive().optional().nullable(),
  recurrence: recurrenceSchema.optional().default("none"),
  format: z.enum(["number", "currency"]).optional().default("number"),
  color: z
    .string()
    .refine(
      (color) => GOAL_COLORS.includes(color as GoalColor),
      "Invalid color"
    )
    .optional(),
});

export const updateGoalSchema = z.object({
  name: z
    .string()
    .min(1, "Goal name is required")
    .max(200, "Goal name is too long")
    .optional(),
  target_amount: z
    .number()
    .positive("Target amount must be positive")
    .optional(),
  current_value: z
    .number()
    .min(0, "Current value cannot be negative")
    .optional(),
  deadline: z.number().int().positive().optional().nullable(),
  recurrence: recurrenceSchema.optional(),
  format: z.enum(["number", "currency"]).optional(),
  color: z
    .string()
    .refine(
      (color) => GOAL_COLORS.includes(color as GoalColor),
      "Invalid color"
    )
    .optional(),
  sort_order: z.number().int().min(0).optional(),
});

// Record schemas
export const createRecordSchema = z.object({
  goal_id: z.string().uuid("Invalid goal ID"),
  amount: z.number().refine((val) => val !== 0, "Amount cannot be zero"),
  description: z.string().max(500, "Description is too long").optional(),
  timestamp: z
    .number()
    .int()
    .positive()
    .optional()
    .default(() => Date.now()),
});

export const updateRecordSchema = z.object({
  amount: z
    .number()
    .refine((val) => val !== 0, "Amount cannot be zero")
    .optional(),
  description: z
    .string()
    .max(500, "Description is too long")
    .optional()
    .nullable(),
  timestamp: z.number().int().positive().optional(),
});

// API token schemas
export const createApiTokenSchema = z.object({
  name: z
    .string()
    .min(1, "Token name is required")
    .max(100, "Token name is too long"),
});

// Profile schemas
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .optional(),
  timezone: z.string().optional(),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Types
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type CreateApiTokenInput = z.infer<typeof createApiTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
