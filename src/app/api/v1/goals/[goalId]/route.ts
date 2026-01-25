import { apiError, apiSuccess, withApiAuth } from "@/lib/api";
import { createServiceClient } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";

/**
 * GET /api/v1/goals/:goalId
 * Get a specific goal by ID
 */
export const GET = withApiAuth(async ({ userId, request }) => {
  // Extract goalId from URL
  const url = new URL(request.url);
  const goalId = url.pathname.split("/").slice(-1)[0];

  const supabase = await createServiceClient();
  const { getGoal } = createServerQueries(supabase);

  const goal = await getGoal(goalId, userId);

  if (!goal) {
    return apiError("Goal not found", 404);
  }

  return apiSuccess({ goal });
});
