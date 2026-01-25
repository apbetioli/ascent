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
    <div className="flex flex-col sm:flex-row gap-4">
      <Button size="lg" onClick={() => scrollToSection("pricing")}>
        Get Started
      </Button>
    </div>
  );
}
