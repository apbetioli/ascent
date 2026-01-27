import { stripe } from "@/lib/payments";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!stripe || !priceId) {
      return NextResponse.json(
        { error: "Price not configured" },
        { status: 503 }
      );
    }

    const price = await stripe.prices.retrieve(priceId);
    if (!price.unit_amount) {
      return NextResponse.json(
        { error: "Unsupported price configuration" },
        { status: 503 }
      );
    }

    const amount = price.unit_amount / 100; // Stripe uses smallest currency unit (cents)

    return NextResponse.json({
      amount,
      currency: price.currency,
      formatted: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: price.currency ?? "usd",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount),
    });
  } catch (error) {
    console.error("Price fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    );
  }
}
