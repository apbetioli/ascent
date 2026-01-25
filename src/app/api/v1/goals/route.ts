import { createServiceClient } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { withApiAuth, apiSuccess, apiError } from "@/lib/api";

/**
 * GET /api/v1/goals
 * List all goals for the authenticated user
 */
export const GET = withApiAuth(async ({ userId }) => {
  const supabase = await createServiceClient();
  const { getGoalsByUser } = createServerQueries(supabase);

  const goals = await getGoalsByUser(userId);

  return apiSuccess({ goals });
});
