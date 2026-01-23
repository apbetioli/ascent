import { authenticateApiRequest, apiError } from "./auth";
import { apiRateLimiter, getRateLimitHeaders, checkRateLimit } from "@/lib/rate-limit";

interface ApiContext {
  userId: string;
  request: Request;
}

type ApiHandler = (context: ApiContext) => Promise<Response>;

/**
 * Wrapper for API routes that handles authentication and rate limiting
 */
export function withApiAuth(handler: ApiHandler) {
  return async (request: Request): Promise<Response> => {
    // Authenticate the request
    const userId = await authenticateApiRequest(request);

    if (!userId) {
      return apiError("Unauthorized. Please provide a valid API token.", 401);
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(apiRateLimiter, userId);
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      return apiError("Rate limit exceeded. Please try again later.", 429, rateLimitHeaders);
    }

    // Call the actual handler
    try {
      const response = await handler({ userId, request });
      
      // Add rate limit headers to the response
      const headers = new Headers(response.headers);
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      console.error("API Error:", error);
      return apiError("Internal server error", 500, rateLimitHeaders);
    }
  };
}
