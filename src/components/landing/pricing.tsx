"use client";

import { PricingCard } from "./pricing-card";
import { useUser } from "@/lib/hooks/use-user";

export function Pricing() {
  const { user, isAuthenticated } = useUser();

  return (
    <section id="pricing" className="py-24 md:py-32 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-3 tracking-wide uppercase">
            Pricing
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            Simple, <span className="text-gradient">one-time</span> pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pay once, use forever. No subscriptions, no hidden fees.
          </p>
        </div>

        <div className="flex justify-center">
          <PricingCard
            isLoggedIn={isAuthenticated}
            userEmail={user?.email ?? undefined}
            userId={user?.id ?? undefined}
          />
        </div>

        <div className="text-center mt-10 text-sm text-muted-foreground space-y-2">
          <p>
            Questions?{" "}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "contact@apbetioli.dev"}`}
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              Contact us
            </a>
          </p>
          <p className="text-xs">30-day money-back guarantee</p>
        </div>
      </div>
    </section>
  );
}
