"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="py-20">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to Achieve Your Goals?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of goal-setters who are crushing their targets with
            GoalTrack. Start tracking today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => scrollToSection("pricing")}>
              Get Started for $29
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            One-time payment. Lifetime access. 30-day money-back guarantee.
          </p>
        </div>
      </div>
    </section>
  );
}
