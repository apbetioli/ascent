"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Now with real-time updates
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
            Track Your Goals,{" "}
            <span className="text-primary">Achieve Your Dreams</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl">
            A beautiful and simple goal tracking app. Set financial goals,
            fitness targets, reading challenges, and more. Watch your progress
            with stunning visual charts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={() => scrollToSection("pricing")}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToSection("features")}>
              See Features
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            One-time payment of $29. No subscription required.
          </p>

          {/* Hero Image/Demo */}
          <div className="w-full max-w-5xl mt-12">
            <div className="relative rounded-xl border bg-muted/30 p-2 shadow-2xl">
              <div className="rounded-lg bg-background p-4 md:p-8">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Demo Goal Card 1 */}
                  <div className="rounded-lg border p-4" style={{ borderTopColor: "#22C55E", borderTopWidth: "3px" }}>
                    <h3 className="font-semibold mb-1">Save for Vacation</h3>
                    <p className="text-xs text-muted-foreground mb-3">12 days left</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-[#22C55E]" style={{ width: "75%" }} />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mt-3">
                      <span>$3,750 / $5,000</span>
                    </div>
                  </div>

                  {/* Demo Goal Card 2 */}
                  <div className="rounded-lg border p-4" style={{ borderTopColor: "#3B82F6", borderTopWidth: "3px" }}>
                    <h3 className="font-semibold mb-1">Read 50 Books</h3>
                    <p className="text-xs text-muted-foreground mb-3">Yearly goal</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">62%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-[#3B82F6]" style={{ width: "62%" }} />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mt-3">
                      <span>31 / 50 books</span>
                    </div>
                  </div>

                  {/* Demo Goal Card 3 */}
                  <div className="rounded-lg border p-4" style={{ borderTopColor: "#EF4444", borderTopWidth: "3px" }}>
                    <h3 className="font-semibold mb-1">Run 500 Miles</h3>
                    <p className="text-xs text-muted-foreground mb-3">Monthly recurring</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">88%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-[#EF4444]" style={{ width: "88%" }} />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mt-3">
                      <span>440 / 500 miles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
