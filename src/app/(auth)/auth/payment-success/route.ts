import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { paymentProvider } from "@/lib/payments";
import { fetchMutation } from "convex/nextjs";
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

    const customerId = session.customer as string;

    await fetchMutation(api.pending_payments.addPendingPayment, {
      email,
      stripeCustomerId: customerId,
      paymentProvider: paymentProvider.getProviderName(),
    });

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
