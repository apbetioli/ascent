"use client";

import { PricingCard } from "./pricing-card";
import { useUser } from "@/lib/hooks/use-user";

export function Pricing() {
  const { user, isAuthenticated } = useUser();

  return (
    <section id="pricing" className="py-20">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, One-Time Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pay once, use forever. No subscriptions, no hidden fees, no limits.
          </p>
        </div>

        <div className="flex justify-center">
          <PricingCard
            isLoggedIn={isAuthenticated}
            userEmail={user?.email ?? undefined}
            userId={user?.id ?? undefined}
          />
        </div>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            Questions?{" "}
            <a
              href="mailto:support@goaltrack.app"
              className="text-primary hover:underline"
            >
              Contact us
            </a>
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}
