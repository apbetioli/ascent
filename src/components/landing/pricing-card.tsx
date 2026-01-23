"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

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
  const router = useRouter();

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      // Redirect to login with redirect back to pricing
      router.push("/login?redirect=/pricing");
      return;
    }

    if (!userId || !userEmail) {
      toast.error("Unable to start checkout. Please try logging in again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
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
        <CardDescription>Everything you need to track your goals</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="mb-6">
          <span className="text-5xl font-bold">$29</span>
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
