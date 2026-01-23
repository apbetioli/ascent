import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateApiToken } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Token name is required" },
        { status: 400 }
      );
    }

    // Generate token
    const { token, hashedToken } = generateApiToken();

    // Store hashed token in database
    const { error } = await supabase.from("api_tokens").insert({
      user_id: user.id,
      name: name.trim(),
      hashed_token: hashedToken,
    });

    if (error) {
      console.error("Failed to create token:", error);
      return NextResponse.json(
        { error: "Failed to create token" },
        { status: 500 }
      );
    }

    // Return the unhashed token (only time user will see it)
    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    console.error("Token creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
