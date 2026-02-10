"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/app-name";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const priceFormatted = `$${process.env.NEXT_PUBLIC_PRICE ?? ""}`;
  const router = useRouter();

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

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
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

      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative">
      {/* Glow effect behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400 rounded-2xl opacity-20 blur-xl" />

      <div className="relative bg-card border border-border/50 rounded-2xl overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400" />

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">{APP_NAME}</h3>
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
              Lifetime Deal
            </Badge>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                {priceFormatted ?? "$"}
              </span>
              <span className="text-muted-foreground">one-time</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Everything you need to track and achieve your goals.
            </p>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base mb-8"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>

          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 dark:bg-green-500/15 shrink-0">
                  <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-foreground/80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
