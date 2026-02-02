import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { paymentProvider } from "@/lib/payments";
import { fetchAction, fetchMutation } from "convex/nextjs";
import { api } from "convex/_generated/api";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(`${origin}/#pricing?error=missing_session`);
  }

  if (!stripe) {
    console.error("Stripe is not configured");
    return NextResponse.redirect(
      `${origin}/#pricing?error=configuration_error`
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(
        `${origin}/#pricing?error=payment_not_completed`
      );
    }

    const email =
      session.metadata?.email ||
      session.customer_email ||
      session.customer_details?.email;

    if (!email) {
      return NextResponse.redirect(`${origin}/#pricing?error=missing_email`);
    }

    // Stripe may not create a Customer for one-time payments with customer_email only
    const customerId =
      typeof session.customer === "string" ? session.customer : undefined;

    await fetchMutation(api.pending_payments.addPendingPayment, {
      email,
      ...(customerId != null && { stripeCustomerId: customerId }),
      paymentProvider: paymentProvider.getProviderName(),
    });

    // If user already has a profile, set hasPaid immediately
    await fetchMutation(api.profiles.setHasPaidByEmail, {
      email,
      paymentProvider: paymentProvider.getProviderName(),
      ...(customerId != null && { stripeCustomerId: customerId }),
    });

    // Create a magic link and redirect the user to it so they're logged in directly.
    // Magic link destination is /login?redirect=/boards so code exchange runs on a public route.
    // SITE_URL (or CONVEX_SITE_URL) must be set in Convex for this to work: npx convex env set SITE_URL http://localhost:3000
    try {
      const magicLinkUrl = await fetchAction(
        api.magic_links.createMagicLinkForEmail,
        {
          email,
          redirectTo: `${origin}/login?redirect=/boards`,
        }
      );
      if (magicLinkUrl) {
        await fetchMutation(api.magic_links.consumeForEmail, { email });
        return NextResponse.redirect(magicLinkUrl);
      }
      console.warn(
        "Payment success: createMagicLinkForEmail returned no URL (check SITE_URL in Convex)"
      );
    } catch (autoLoginError) {
      console.error("Auto-login after payment failed:", autoLoginError);
    }

    // Fallback: send to login page with email prefilled
    return NextResponse.redirect(
      `${origin}/login?email=${encodeURIComponent(email)}&fromPayment=1&redirect=/boards`
    );
  } catch (error) {
    console.error("Payment success error:", error);
    return NextResponse.redirect(
      `${origin}/#pricing?error=verification_failed`
    );
  }
}
