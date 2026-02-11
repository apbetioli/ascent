import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/recordVisit",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "127.0.0.1";
    await ctx.runMutation(internal.visitors.recordVisit, { ipAddress: ip });
    return new Response(null, { status: 204 });
  }),
});

http.route({
  path: "/checkAuthRateLimit",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      req.headers.get("x-ratelimit-ip") ??
      "127.0.0.1";
    const result = await ctx.runMutation(
      internal.rateLimit.checkAuthRateLimit,
      { ip }
    );
    return Response.json(result);
  }),
});

http.route({
  path: "/checkApiRateLimit",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const userId = req.headers.get("x-ratelimit-user") ?? "";
    if (!userId) {
      return Response.json(
        { error: "Missing x-ratelimit-user header" },
        { status: 400 }
      );
    }
    const result = await ctx.runMutation(
      internal.rateLimit.checkApiRateLimit,
      { userId }
    );
    return Response.json(result);
  }),
});

export default http;
