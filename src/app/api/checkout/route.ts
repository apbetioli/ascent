import { paymentProvider } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, userId } = body;

    const supabase = await createClient();

    // If userId is provided, verify user is authenticated and check if already paid
    if (userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("has_paid")
        .eq("id", user.id)
        .single();

      if (profile?.has_paid) {
        return NextResponse.json(
          { error: "You have already purchased GoalTrack" },
          { status: 400 }
        );
      }
    }

    // Create checkout session
    // Email is optional - if not provided, Stripe will collect it during checkout
    const checkoutUrl = await paymentProvider.createCheckoutUrl(
      email || undefined,
      userId
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
