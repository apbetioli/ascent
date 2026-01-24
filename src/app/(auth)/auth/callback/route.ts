import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/boards";

  const supabase = await createClient();

  // Handle OAuth callback with code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return await handleSuccessfulAuth(supabase, origin, next, request);
    }
  }

  // Handle magic link with token
  // When Supabase verifies a magic link token at /auth/v1/verify,
  // it sets session cookies and redirects. If the redirect includes
  // the token, we need to verify it to ensure the session is established.
  if (token && type === "magiclink") {
    // First check if session already exists (token might have been verified via Supabase's endpoint)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!userError && user) {
      return await handleSuccessfulAuth(supabase, origin, next, request);
    }

    // If no session, verify the token explicitly
    // The token from generateLink is the hashed_token, which verifyOtp accepts
    const { data: verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        token_hash: token,
        type: "magiclink",
      });

    if (!verifyError && verifyData.session) {
      // Session created, now check if user exists
      const {
        data: { user: verifiedUser },
      } = await supabase.auth.getUser();

      if (verifiedUser) {
        return await handleSuccessfulAuth(supabase, origin, next, request);
      }
    }

    // If verification failed, log and redirect to login
    if (verifyError) {
      console.error("Token verification failed:", verifyError);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

async function handleSuccessfulAuth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  origin: string,
  next: string,
  request: Request
) {
  // Check if user has paid
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_paid")
      .eq("id", user.id)
      .single<{ has_paid: boolean }>();

    // If user hasn't paid, redirect to pricing
    if (!profile?.has_paid) {
      return NextResponse.redirect(
        `${origin}/#pricing?redirect=${encodeURIComponent(next)}`
      );
    }
  }

  let redirectPath = next;
  if (next === "/boards" && user) {
    const { data: boards } = await supabase
      .from("boards")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(2);
    if (boards?.length === 1) {
      redirectPath = `/boards/${boards[0].id}`;
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${redirectPath}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
  } else {
    return NextResponse.redirect(`${origin}${redirectPath}`);
  }
}
