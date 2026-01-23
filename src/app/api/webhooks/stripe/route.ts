import { NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const result = await paymentProvider.handleWebhook(req);

  if (!result.success) {
    console.error("Stripe webhook error:", result.error);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // If payment was successful, update the user's profile
  if (result.paid && result.userId && result.customerId) {
    const supabase = await createServiceClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        has_paid: true,
        payment_provider: paymentProvider.getProviderName(),
        payment_customer_id: result.customerId,
      })
      .eq("id", result.userId);

    if (error) {
      console.error("Failed to update profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
