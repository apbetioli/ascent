import Stripe from "stripe";
import type { PaymentProvider, WebhookResult } from "./types";

// Only initialize Stripe if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    })
  : null;

export const stripeProvider: PaymentProvider = {
  async createCheckoutUrl(userId: string, email: string): Promise<string> {
    if (!stripe) {
      throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY.");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      metadata: {
        userId,
      },
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/boards?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
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
      return { success: false, error: `Webhook signature verification failed: ${message}` };
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;

      if (!userId) {
        return { success: false, error: "Missing userId in metadata" };
      }

      return {
        success: true,
        userId,
        customerId,
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
