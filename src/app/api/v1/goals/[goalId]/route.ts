import { createServiceClient } from "@/lib/supabase/server";
import { withApiAuth, apiSuccess, apiError } from "@/lib/api";

interface RouteParams {
  params: Promise<{ goalId: string }>;
}

/**
 * GET /api/v1/goals/:goalId
 * Get a specific goal by ID
 */
export const GET = withApiAuth(async ({ userId, request }) => {
  // Extract goalId from URL
  const url = new URL(request.url);
  const goalId = url.pathname.split("/").slice(-1)[0];

  const supabase = await createServiceClient();

  const { data: goal, error } = await supabase
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
    .eq("id", goalId)
    .eq("user_id", userId)
    .single();

  if (error || !goal) {
    return apiError("Goal not found", 404);
  }

  return apiSuccess({ goal });
});
