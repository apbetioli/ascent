import { NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const result = await paymentProvider.handleWebhook(req);

  if (!result.success) {
    console.error("Stripe webhook error:", result.error);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // If payment was successful, ensure user exists and update profile
  if (result.paid && result.email && result.customerId) {
    const supabase = await createServiceClient();
    let userId = result.userId;

    // If userId not provided, check if user exists by email
    if (!userId) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(
        (u) => u.email === result.email
      );

      if (existingUser) {
        userId = existingUser.id;
        // Check if user has already paid
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("has_paid")
          .eq("id", userId)
          .single();

        if (existingProfile?.has_paid) {
          console.log("User has already paid, skipping profile update");
          return NextResponse.json({ received: true });
        }
      } else {
        // Create new user account
        const { data: newUser, error: createError } =
          await supabase.auth.admin.createUser({
            email: result.email!,
            email_confirm: true, // Auto-confirm email since they paid
            user_metadata: {
              created_via: "stripe_checkout",
            },
          });

        if (createError || !newUser.user) {
          console.error("Failed to create user:", createError);
          return NextResponse.json(
            { error: "Failed to create user account" },
            { status: 500 }
          );
        }

        userId = newUser.user.id;
      }
    } else {
      // Verify existing user hasn't already paid
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("has_paid")
        .eq("id", userId)
        .single();

      if (existingProfile?.has_paid) {
        console.log("User has already paid, skipping profile update");
        return NextResponse.json({ received: true });
      }
    }

    // Update or create profile with payment info
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          has_paid: true,
          payment_provider: paymentProvider.getProviderName(),
          payment_customer_id: result.customerId,
        },
        {
          onConflict: "id",
        }
      );

    if (profileError) {
      console.error("Failed to update profile:", profileError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
