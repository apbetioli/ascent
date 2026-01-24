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
    // The token has already been verified by Supabase's /auth/v1/verify endpoint
    // and session cookies should be set. We just need to verify the session exists.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!userError && user) {
      return await handleSuccessfulAuth(supabase, origin, next, request);
    }

    // If no user, try verifying the token explicitly
    // Note: verifyOtp expects token_hash, but the token from the URL might need different handling
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "magiclink",
    });

    if (!verifyError) {
      return await handleSuccessfulAuth(supabase, origin, next, request);
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

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${next}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  } else {
    return NextResponse.redirect(`${origin}${next}`);
  }
}
