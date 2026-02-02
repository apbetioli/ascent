import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { withApiAuth, apiSuccess, apiError } from "@/lib/api";
import { convexRecordToApi } from "@/lib/api/convex-to-api";
import { updateRecordSchema } from "@/lib/validations";

function getPathIds(request: Request) {
  const pathParts = new URL(request.url).pathname.split("/");
  const goalId = pathParts[pathParts.indexOf("goals") + 1] as Id<"goals">;
  const recordId = pathParts[pathParts.indexOf("records") + 1] as Id<"records">;
  return { goalId, recordId };
}

/**
 * PUT /api/v1/goals/:goalId/records/:recordId
 * Update a record
 */
export const PUT = withApiAuth(async ({ userId, request }) => {
  const { goalId, recordId } = getPathIds(request);

  const record = await fetchQuery(api.records.getRecord, { recordId });
  if (!record || record.userId !== userId || record.goalId !== goalId) {
    return apiError("Record not found", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const validation = updateRecordSchema.safeParse(body ?? {});

  if (!validation.success) {
    return apiError(validation.error.issues[0].message, 400);
  }

  const updates: { amount?: number; description?: string; timestamp?: number } =
    {};
  if (validation.data.amount !== undefined)
    updates.amount = validation.data.amount;
  if (validation.data.description !== undefined)
    updates.description = validation.data.description ?? undefined;
  if (validation.data.timestamp !== undefined)
    updates.timestamp = validation.data.timestamp;

  if (Object.keys(updates).length === 0) {
    return apiError("No updates provided", 400);
  }

  try {
    await fetchMutation(api.records.updateRecord, {
      recordId,
      userId: userId as Id<"users">,
      ...updates,
    });

    const updated = await fetchQuery(api.records.getRecord, { recordId });
    if (!updated) return apiError("Failed to update record", 500);

    return apiSuccess({ record: convexRecordToApi(updated) });
  } catch (error) {
    console.error("Update record error:", error);
    return apiError("Failed to update record", 500);
  }
});

/**
 * DELETE /api/v1/goals/:goalId/records/:recordId
 * Delete a record
 */
export const DELETE = withApiAuth(async ({ userId, request }) => {
  const { goalId, recordId } = getPathIds(request);

  const record = await fetchQuery(api.records.getRecord, { recordId });
  if (!record || record.userId !== userId || record.goalId !== goalId) {
    return apiError("Record not found", 404);
  }

  try {
    await fetchMutation(api.records.deleteRecord, {
      recordId,
      userId: userId as Id<"users">,
    });
    return apiSuccess({ success: true });
  } catch (error) {
    console.error("Delete record error:", error);
    return apiError("Failed to delete record", 500);
  }
});
