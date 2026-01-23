import { createServiceClient } from "@/lib/supabase/server";
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

  // Verify goal ownership
  const { data: goal } = await supabase
    .from("goals")
    .select("id")
    .eq("id", goalId)
    .eq("user_id", userId)
    .single();

  if (!goal) {
    return apiError("Goal not found", 404);
  }

  const { data: records, error } = await supabase
    .from("records")
    .select(`
      id,
      goal_id,
      amount,
      description,
      timestamp
    `)
    .eq("goal_id", goalId)
    .order("timestamp", { ascending: false });

  if (error) {
    return apiError("Failed to fetch records", 500);
  }

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

  // Verify goal ownership
  const { data: goal } = await supabase
    .from("goals")
    .select("id")
    .eq("id", goalId)
    .eq("user_id", userId)
    .single();

  if (!goal) {
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

  const { data: record, error } = await supabase
    .from("records")
    .insert({
      goal_id: goalId,
      user_id: userId,
      amount,
      description: description || null,
      timestamp,
    })
    .select()
    .single();

  if (error) {
    return apiError("Failed to create record", 500);
  }

  return apiSuccess({ record }, 201);
});
