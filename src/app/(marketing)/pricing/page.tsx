import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PricingCard } from "@/components/landing/pricing-card";
import Link from "next/link";
import { Target } from "lucide-react";

export const metadata = {
  title: "Pricing",
  description: "Simple, one-time pricing for GoalTrack. Pay once, use forever.",
};

export default async function PricingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in and has paid, redirect to boards
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_paid")
      .eq("id", user.id)
      .single();

    if (profile?.has_paid) {
      redirect("/boards");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Target className="h-5 w-5 text-primary" />
            <span>GoalTrack</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pay once, use forever. No subscriptions, no hidden fees.
          </p>
        </div>

        <div className="flex justify-center">
          <PricingCard
            isLoggedIn={!!user}
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
        </div>
      </main>
    </div>
  );
}
