"use client";

import { Button } from "@/components/ui/button";

export function HeroButtons() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        size="lg"
        onClick={() => scrollToSection("pricing")}
        className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 text-base"
      >
        Start tracking your goals
      </Button>
    </div>
  );
}
