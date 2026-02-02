import { paymentProvider } from "@/lib/payments";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "convex/_generated/api";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, userId: bodyUserId } = body as {
      email?: string;
      userId?: string;
    };

    const token = await convexAuthNextjsToken();

    if (bodyUserId) {
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userId = await fetchQuery(
        api.profiles.getCurrentUserId,
        {},
        { token }
      );

      if (!userId || userId !== bodyUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const profile = await fetchQuery(
        api.profiles.getProfile,
        { userId },
        { token }
      );

      if (profile?.hasPaid) {
        return NextResponse.json(
          { error: "You have already purchased GoalTrack" },
          { status: 400 }
        );
      }
    }

    const checkoutUrl = await paymentProvider.createCheckoutUrl(
      email || undefined,
      bodyUserId
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
