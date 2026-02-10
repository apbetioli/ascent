"use client";

import { APP_NAME } from "@/lib/app-name";
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
    <section className="py-24 md:py-32 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10" />

      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-green-500/8 dark:bg-green-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            Ready for the <span className="text-gradient">ascent</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Join thousands reaching higher with {APP_NAME}. Start today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => scrollToSection("pricing")}
              className="bg-green-600 hover:bg-green-700 text-white h-12 px-8 text-base"
            >
              Start now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-5">
            One-time payment &middot; Lifetime access &middot; 30-day money-back
            guarantee
          </p>
        </div>
      </div>
    </section>
  );
}
