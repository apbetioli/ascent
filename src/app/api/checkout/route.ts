import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentProvider } from "@/lib/payments";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has already paid
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

    // Create checkout session
    const checkoutUrl = await paymentProvider.createCheckoutUrl(
      user.id,
      user.email!
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
