import { NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "convex/_generated/api";

export async function POST(req: Request) {
  try {
    const token = await convexAuthNextjsToken();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await fetchQuery(
      api.profiles.getCurrentUserId,
      {},
      { token }
    );

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body as { name?: string };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Token name is required" },
        { status: 400 }
      );
    }

    const { token: apiToken } = await fetchMutation(
      api.apiTokens.createApiToken,
      {
        userId,
        name: name.trim(),
      }
    );

    return NextResponse.json({ token: apiToken }, { status: 201 });
  } catch (error) {
    console.error("Token creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
