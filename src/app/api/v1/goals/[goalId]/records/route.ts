import { createServiceClient } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { withApiAuth, apiSuccess, apiError } from "@/lib/api";
import { createRecordSchema } from "@/lib/validations";

/**
 * GET /api/v1/goals/:goalId/records
 * List all records for a goal
 */
export const GET = withApiAuth(async ({ userId, request }) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const goalId = pathParts[pathParts.indexOf("goals") + 1];

  const supabase = await createServiceClient();
  const { verifyGoalOwnership, getRecordsByGoal } = createServerQueries(supabase);

  // Verify goal ownership
  const isOwner = await verifyGoalOwnership(goalId, userId);
  if (!isOwner) {
    return apiError("Goal not found", 404);
  }

  const records = await getRecordsByGoal(goalId);

  return apiSuccess({ records });
});

/**
 * POST /api/v1/goals/:goalId/records
 * Add a new record to a goal
 */
export const POST = withApiAuth(async ({ userId, request }) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const goalId = pathParts[pathParts.indexOf("goals") + 1];

  const supabase = await createServiceClient();
  const { verifyGoalOwnership, createRecord } = createServerQueries(supabase);

  // Verify goal ownership
  const isOwner = await verifyGoalOwnership(goalId, userId);
  if (!isOwner) {
    return apiError("Goal not found", 404);
  }

  // Parse and validate body
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const validation = createRecordSchema.safeParse({
    ...body,
    goal_id: goalId,
  });

  if (!validation.success) {
    return apiError(validation.error.issues[0].message, 400);
  }

  const { amount, description, timestamp } = validation.data;

  try {
    const record = await createRecord({
      goal_id: goalId,
      user_id: userId,
      amount,
      description: description || null,
      timestamp,
    });

    return apiSuccess({ record }, 201);
  } catch (error) {
    return apiError("Failed to create record", 500);
  }
});
