import type { AuthConfig } from "convex/server";

/**
 * Tells Convex how to validate JWTs issued by @convex-dev/auth.
 * Required for ctx.auth.getUserIdentity() and auth:isAuthenticated.
 * Set CONVEX_SITE_URL (or SITE_URL) in Convex dashboard, e.g. http://localhost:3000
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL ?? process.env.SITE_URL ?? "",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
