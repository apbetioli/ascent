import Stripe from "stripe";
import type { PaymentProvider, WebhookResult } from "./types";

// Only initialize Stripe if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    })
  : null;

export const stripeProvider: PaymentProvider = {
  async createCheckoutUrl(email?: string, userId?: string): Promise<string> {
    if (!stripe) {
      throw new Error(
        "Stripe is not configured. Please set STRIPE_SECRET_KEY."
      );
    }

    const metadata: Record<string, string> = {};
    if (email) {
      metadata.email = email;
    }
    if (userId) {
      metadata.userId = userId;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      ...(email && { customer_email: email }),
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing?payment=cancelled`,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session");
    }

    return session.url;
  },

  async handleWebhook(req: Request): Promise<WebhookResult> {
    if (!stripe) {
      return { success: false, error: "Stripe is not configured" };
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return { success: false, error: "Missing signature" };
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        error: `Webhook signature verification failed: ${message}`,
      };
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const email =
        session.metadata?.email ||
        session.customer_email ||
        session.customer_details?.email;
      const customerId = session.customer as string;
      const sessionId = session.id;

      console.log("email", email, session);

      if (!email) {
        return { success: false, error: "Missing email in session" };
      }

      return {
        success: true,
        userId,
        email,
        customerId,
        sessionId,
        paid: true,
      };
    }

    // For other event types, just acknowledge receipt
    return { success: true };
  },

  getProviderName(): string {
    return "stripe";
  },
};

export { stripe };
