import { createServiceClient } from "@/lib/supabase/server";
import { createServerQueries } from "@/lib/supabase/server-queries";
import { createHash } from "crypto";

/**
 * Hash a token for storage/comparison
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a new API token (returns unhashed token for user, plus hashed for storage)
 */
export function generateApiToken(): { token: string; hashedToken: string } {
  const token = `gt_${crypto.randomUUID().replace(/-/g, "")}`;
  const hashedToken = hashToken(token);
  return { token, hashedToken };
}

/**
 * Authenticate a request using Bearer token
 * Returns the user_id if valid, null otherwise
 */
export async function authenticateApiRequest(
  request: Request
): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  const hashedToken = hashToken(token);

  const supabase = await createServiceClient();
  const { getApiTokenByHash } = createServerQueries(supabase);

  const apiToken = await getApiTokenByHash(hashedToken);

  return apiToken?.user_id ?? null;
}

/**
 * Create an error response with proper format
 */
export function apiError(
  message: string,
  status: number,
  headers?: Record<string, string>
): Response {
  return Response.json(
    { error: message },
    { status, headers }
  );
}

/**
 * Create a success response with proper format
 */
export function apiSuccess<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): Response {
  return Response.json(data, { status, headers });
}
