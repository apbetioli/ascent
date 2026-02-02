import { fetchAction } from "convex/nextjs";
import { api } from "convex/_generated/api";

/**
 * Generate a new API token (Convex creates and stores; this is only for reference).
 * Actual token creation is done via Convex mutation api.api_tokens.createApiToken.
 */
export function generateApiToken(): { token: string; hashedToken: string } {
  const token = `gt_${crypto.randomUUID().replace(/-/g, "")}`;
  // Hashing is done in Convex; this is only for legacy compatibility if needed
  const hashedToken = "";
  return { token, hashedToken };
}

/**
 * Authenticate a request using Bearer token.
 * Returns the Convex userId if valid, null otherwise.
 */
export async function authenticateApiRequest(
  request: Request
): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  try {
    const userId = await fetchAction(api.api_tokens.getUserIdForApiAuth, {
      token,
    });
    return userId;
  } catch (error) {
    console.error("API auth error:", error);
    return null;
  }
}

/**
 * Create an error response with proper format
 */
export function apiError(
  message: string,
  status: number,
  headers?: Record<string, string>
): Response {
  return Response.json({ error: message }, { status, headers });
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
