import { NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments";
import { fetchMutation } from "convex/nextjs";
import { api } from "convex/_generated/api";

export async function POST(req: Request) {
  const result = await paymentProvider.handleWebhook(req);

  if (!result.success) {
    console.error("Stripe webhook error:", result.error);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (result.paid && result.email && result.customerId) {
    try {
      await fetchMutation(api.pending_payments.addPendingPayment, {
        email: result.email,
        stripeCustomerId: result.customerId,
        paymentProvider: paymentProvider.getProviderName(),
      });
    } catch (error) {
      console.error("Failed to add pending payment:", error);
      return NextResponse.json(
        { error: "Failed to record payment" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
