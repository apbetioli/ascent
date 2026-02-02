import { fetchQuery } from "convex/nextjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { withApiAuth, apiSuccess } from "@/lib/api";
import { convexGoalToApi } from "@/lib/api/convex-to-api";

/**
 * GET /api/v1/goals
 * List all goals for the authenticated user
 */
export const GET = withApiAuth(async ({ userId }) => {
  const goals = await fetchQuery(api.goals.listGoalsByUser, {
    userId: userId as Id<"users">,
  });

  return apiSuccess({
    goals: goals.map(convexGoalToApi),
  });
});
