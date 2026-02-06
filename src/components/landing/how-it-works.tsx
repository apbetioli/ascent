import { Target, TrendingUp, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const steps: { number: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    number: "01",
    title: "Create your goals",
    description:
      "Set up goals in seconds. Add a target amount, optional deadline, recurrence, and pick a color. Financial, fitness, learning — anything.",
    icon: Target,
  },
  {
    number: "02",
    title: "Track your progress",
    description:
      "Log progress as you go. Each entry updates your progress bar instantly. See exactly how close you are to hitting your target.",
    icon: TrendingUp,
  },
  {
    number: "03",
    title: "Achieve & celebrate",
    description:
      "Watch progress bars fill up. Hit 100% and celebrate! Surpass your goals and see the overflow. Then set the next one.",
    icon: Trophy,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3 tracking-wide uppercase">
            How it works
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            Three steps to{" "}
            <span className="text-gradient">crushing it</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started takes less than a minute.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="relative group">
              <div className="bg-background rounded-2xl border border-border/50 p-8 h-full transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/15">
                    <step.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/30">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
