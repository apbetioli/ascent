import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/payments/stripe";
import { paymentProvider } from "@/lib/payments";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(`${origin}/#pricing?error=missing_session`);
  }

  if (!stripe) {
    console.error("Stripe is not configured");
    return NextResponse.redirect(`${origin}/#pricing?error=configuration_error`);
  }

  try {
    // Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(`${origin}/#pricing?error=payment_not_completed`);
    }

    const email =
      session.metadata?.email ||
      session.customer_email ||
      session.customer_details?.email;

    if (!email) {
      return NextResponse.redirect(`${origin}/#pricing?error=missing_email`);
    }

    const supabase = await createServiceClient();

    // Find user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    let user = users?.users.find((u) => u.email === email);
    let userId = user?.id;

    // If user doesn't exist, create them
    if (!user) {
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: email,
          email_confirm: true, // Auto-confirm email since they paid
          user_metadata: {
            created_via: "stripe_checkout",
          },
        });

      if (createError || !newUser.user) {
        console.error("Failed to create user:", createError);
        return NextResponse.redirect(
          `${origin}/login?error=user_creation_failed&email=${encodeURIComponent(email)}`
        );
      }

      user = newUser.user;
      userId = newUser.user.id;
    }

    // Ensure profile exists and is marked as paid
    const customerId = session.customer as string;
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId!,
          has_paid: true,
          payment_provider: paymentProvider.getProviderName(),
          payment_customer_id: customerId,
        },
        {
          onConflict: "id",
        }
      );

    if (profileError) {
      console.error("Failed to update profile:", profileError);
      // Continue anyway - user exists, profile update can happen via webhook
    }

    // Generate a magic link for auto-login
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: email,
        options: {
          redirectTo: `${origin}/auth/callback?next=/boards`,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Failed to generate magic link:", linkError);
      // Fallback: redirect to login with email pre-filled
      // User can use magic link from there
      return NextResponse.redirect(
        `${origin}/login?email=${encodeURIComponent(email)}&redirect=/boards`
      );
    }

    // Redirect directly to the magic link (it will auto-verify and log in)
    return NextResponse.redirect(linkData.properties.action_link);
  } catch (error) {
    console.error("Payment success error:", error);
    return NextResponse.redirect(`${origin}/#pricing?error=verification_failed`);
  }
}
