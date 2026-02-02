import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { withApiAuth, apiSuccess, apiError } from "@/lib/api";
import { convexRecordToApi } from "@/lib/api/convex-to-api";
import { createRecordSchema } from "@/lib/validations";

/**
 * GET /api/v1/goals/:goalId/records
 * List all records for a goal
 */
export const GET = withApiAuth(async ({ userId, request }) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const goalId = pathParts[pathParts.indexOf("goals") + 1] as Id<"goals">;

  const goal = await fetchQuery(api.goals.getGoal, {
    goalId,
    userId: userId as Id<"users">,
  });

  if (!goal) {
    return apiError("Goal not found", 404);
  }

  const records = await fetchQuery(api.records.listRecordsByGoal, { goalId });

  return apiSuccess({
    records: records.map(convexRecordToApi),
  });
});

/**
 * POST /api/v1/goals/:goalId/records
 * Add a new record to a goal
 */
export const POST = withApiAuth(async ({ userId, request }) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const goalId = pathParts[pathParts.indexOf("goals") + 1] as Id<"goals">;

  const goal = await fetchQuery(api.goals.getGoal, {
    goalId,
    userId: userId as Id<"users">,
  });

  if (!goal) {
    return apiError("Goal not found", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const validation = createRecordSchema.safeParse({
    ...(typeof body === "object" && body !== null ? body : {}),
    goal_id: goalId,
  });

  if (!validation.success) {
    return apiError(validation.error.issues[0].message, 400);
  }

  const { amount, description, timestamp } = validation.data;

  try {
    const recordId = await fetchMutation(api.records.createRecord, {
      goalId,
      userId: userId as Id<"users">,
      amount,
      description: description ?? undefined,
      timestamp,
    });

    const record = await fetchQuery(api.records.getRecord, {
      recordId: recordId,
    });
    if (!record) return apiError("Failed to create record", 500);

    return apiSuccess({ record: convexRecordToApi(record) }, 201);
  } catch (error) {
    console.error("Create record error:", error);
    return apiError("Failed to create record", 500);
  }
});
