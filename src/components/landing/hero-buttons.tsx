"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

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
        className="bg-purple-600 hover:bg-purple-700 text-white px-8 h-12 text-base"
      >
        Start tracking goals
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <Button size="lg" variant="outline" className="h-12 text-base px-8" asChild>
        <Link href="/login">Log in</Link>
      </Button>
    </div>
  );
}
