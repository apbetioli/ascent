import { fetchQuery } from "convex/nextjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { apiError, apiSuccess, withApiAuth } from "@/lib/api";
import { convexGoalToApi } from "@/lib/api/convex-to-api";

/**
 * GET /api/v1/goals/:goalId
 * Get a specific goal by ID
 */
export const GET = withApiAuth(async ({ userId, request }) => {
  const url = new URL(request.url);
  const goalId = url.pathname.split("/").slice(-1)[0] as Id<"goals">;

  const goal = await fetchQuery(api.goals.getGoal, {
    goalId,
    userId: userId as Id<"users">,
  });

  if (!goal) {
    return apiError("Goal not found", 404);
  }

  return apiSuccess({ goal: convexGoalToApi(goal) });
});
