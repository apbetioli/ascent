"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => scrollToSection("features")}
      >
        See Features
      </Button>
    </div>
  );
}
