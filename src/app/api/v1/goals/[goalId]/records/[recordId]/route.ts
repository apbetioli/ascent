import { createServiceClient } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { withApiAuth, apiSuccess, apiError } from "@/lib/api";
import { updateRecordSchema } from "@/lib/validations";

/**
 * PUT /api/v1/goals/:goalId/records/:recordId
 * Update a record
 */
export const PUT = withApiAuth(async ({ userId, request }) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const goalId = pathParts[pathParts.indexOf("goals") + 1];
  const recordId = pathParts[pathParts.indexOf("records") + 1];

  const supabase = await createServiceClient();
  const { verifyRecordOwnership, updateRecord } = createServerQueries(supabase);

  // Verify record ownership
  const isOwner = await verifyRecordOwnership(recordId, goalId, userId);
  if (!isOwner) {
    return apiError("Record not found", 404);
  }

  // Parse and validate body
  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const validation = updateRecordSchema.safeParse(body);

  if (!validation.success) {
    return apiError(validation.error.issues[0].message, 400);
  }

  const updates: Record<string, unknown> = {};
  if (validation.data.amount !== undefined) updates.amount = validation.data.amount;
  if (validation.data.description !== undefined) updates.description = validation.data.description;
  if (validation.data.timestamp !== undefined) updates.timestamp = validation.data.timestamp;

  if (Object.keys(updates).length === 0) {
    return apiError("No updates provided", 400);
  }

  try {
    const record = await updateRecord(recordId, updates);
    return apiSuccess({ record });
  } catch (error) {
    return apiError("Failed to update record", 500);
  }
});

/**
 * DELETE /api/v1/goals/:goalId/records/:recordId
 * Delete a record
 */
export const DELETE = withApiAuth(async ({ userId, request }) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const goalId = pathParts[pathParts.indexOf("goals") + 1];
  const recordId = pathParts[pathParts.indexOf("records") + 1];

  const supabase = await createServiceClient();
  const { verifyRecordOwnership, deleteRecord } = createServerQueries(supabase);

  // Verify record ownership
  const isOwner = await verifyRecordOwnership(recordId, goalId, userId);
  if (!isOwner) {
    return apiError("Record not found", 404);
  }

  try {
    await deleteRecord(recordId);
    return apiSuccess({ success: true });
  } catch (error) {
    return apiError("Failed to delete record", 500);
  }
});
