"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PricingCardProps {
  isLoggedIn: boolean;
  userEmail?: string;
  userId?: string;
}

const features = [
  "Unlimited boards",
  "Unlimited goals",
  "Unlimited records",
  "Progress tracking with visual charts",
  "Recurring goals (daily, weekly, monthly, yearly)",
  "Public board sharing",
  "Embeddable goal widgets",
  "API access for automation",
  "Real-time updates",
  "Lifetime access",
];

export function PricingCard({
  isLoggedIn,
  userEmail,
  userId,
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [priceFormatted, setPriceFormatted] = useState<string | null>("$5");
  const router = useRouter();

  // useEffect(() => {
  //   fetch("/api/price")
  //     .then((res) => (res.ok ? res.json() : null))
  //     .then((data: { formatted?: string } | null) =>
  //       setPriceFormatted(data?.formatted ?? null)
  //     )
  //     .catch(() => setPriceFormatted(null));
  // }, []);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: isLoggedIn ? userEmail : undefined,
          userId: isLoggedIn ? userId : undefined,
        }),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Return to pricing after login so user can try checkout again
          const returnTo =
            typeof window !== "undefined"
              ? `${window.location.pathname}${window.location.hash || "#pricing"}`
              : "/#pricing";
          router.push(`/login?redirect=${encodeURIComponent(returnTo)}`);
          return;
        }
        return;
      }

      const url = data?.url;
      if (!url || typeof url !== "string") return;

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md relative overflow-hidden">
      <div className="absolute top-4 right-4">
        <Badge variant="secondary">Lifetime Deal</Badge>
      </div>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">GoalTrack Pro</CardTitle>
        <CardDescription>
          Everything you need to track your goals
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="mb-6">
          <span className="text-5xl font-bold">{priceFormatted ?? "$"}</span>
          <span className="text-muted-foreground ml-2">one-time</span>
        </div>
        <ul className="text-left space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoggedIn ? "Get Started" : "Sign Up & Pay"}
        </Button>
      </CardFooter>
    </Card>
  );
}
