"use client";

import { APP_NAME } from "@/lib/app-name";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex h-14 items-center">
        <div className="flex-1">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <Target className="h-5 w-5 text-green-500" />
            <span>{APP_NAME}</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <button
            onClick={() => scrollToSection("features")}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>
        <div className="flex-1 flex justify-end items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          {/* <Button
            size="sm"
            onClick={() => scrollToSection("pricing")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Get Started
          </Button> */}
        </div>
      </div>
    </header>
  );
}
