import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/boards";

  // Create Supabase client for route handler with proper cookie handling
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Store cookies as they're set so we can copy them to redirect responses
  const storedCookies: Array<{ name: string; value: string; options?: any }> = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers
            .get("cookie")
            ?.split(";")
            .map((cookie) => {
              const [name, ...rest] = cookie.trim().split("=");
              return { name, value: rest.join("=") };
            }) || [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
            storedCookies.push({ name, value, options });
          });
        },
      },
    }
  );

  // Handle OAuth callback with code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return await handleSuccessfulAuth(supabase, origin, next, request, storedCookies);
    }
  }

  // Handle magic link with token
  // When Supabase verifies a magic link token at /auth/v1/verify,
  // it sets session cookies and redirects. The redirect may or may not include
  // the token in the URL. First check if session already exists.
  if (token && type === "magiclink") {
    // First check if session already exists (token might have been verified via Supabase's endpoint)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!userError && user) {
      return await handleSuccessfulAuth(supabase, origin, next, request, storedCookies);
    }

    // If no session, verify the token explicitly
    // For magic links, Supabase typically sends token_hash in the redirect URL
    const { data: verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        token_hash: token,
        type: "magiclink",
      });

    if (!verifyError && verifyData?.session) {
      // Session created, now check if user exists
      const {
        data: { user: verifiedUser },
      } = await supabase.auth.getUser();

      if (verifiedUser) {
        return await handleSuccessfulAuth(supabase, origin, next, request, storedCookies);
      }
    }

    // If verification failed, log and redirect to login
    if (verifyError) {
      console.error("Token verification failed:", verifyError);
    }
  }

  // If no token but we have a session (Supabase already verified and set cookies),
  // check if user exists and proceed
  if (!token && !code) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!userError && user) {
      return await handleSuccessfulAuth(supabase, origin, next, request, storedCookies);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

async function handleSuccessfulAuth(
  supabase: ReturnType<typeof createServerClient<Database>>,
  origin: string,
  next: string,
  request: Request,
  storedCookies: Array<{ name: string; value: string; options?: any }>
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
      const pricingUrl = `${origin}/#pricing?redirect=${encodeURIComponent(next)}`;
      const pricingResponse = NextResponse.redirect(pricingUrl);
      
      // Copy all stored cookies to the redirect response
      storedCookies.forEach(({ name, value, options }) => {
        pricingResponse.cookies.set(name, value, options);
      });
      
      return pricingResponse;
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

  // Create redirect response with cookies from the original response
  let redirectUrl: string;
  if (isLocalEnv) {
    redirectUrl = `${origin}${redirectPath}`;
  } else if (forwardedHost) {
    redirectUrl = `https://${forwardedHost}${redirectPath}`;
  } else {
    redirectUrl = `${origin}${redirectPath}`;
  }

  const redirectResponse = NextResponse.redirect(redirectUrl);
  
  // Copy all stored cookies to the redirect response
  storedCookies.forEach(({ name, value, options }) => {
    redirectResponse.cookies.set(name, value, options);
  });

  return redirectResponse;
}
