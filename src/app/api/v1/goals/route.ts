import { createServiceClient } from "@/lib/supabase/server";
import { withApiAuth, apiSuccess, apiError } from "@/lib/api";

/**
 * GET /api/v1/goals
 * List all goals for the authenticated user
 */
export const GET = withApiAuth(async ({ userId }) => {
  const supabase = await createServiceClient();

  const { data: goals, error } = await supabase
    .from("goals")
    .select(`
      id,
      embed_id,
      board_id,
      name,
      target_amount,
      current_amount,
      deadline,
      recurrence,
      is_reverse,
      color,
      sort_order,
      created_at,
      updated_at
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return apiError("Failed to fetch goals", 500);
  }

  return apiSuccess({ goals });
});
