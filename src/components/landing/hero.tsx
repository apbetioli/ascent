import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import { getNextColor } from "@/lib/utils/colors";
import { HeroButtons } from "./hero-buttons";
import { InteractiveDemoGoal } from "./interactive-demo-goal";
import Visitors from "./visitors";

type GoalRecurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

function createDemoGoal(
  name: string,
  current: number,
  target: number,
  format: "number" | "currency",
  index: number,
  options?: { deadline?: number; recurrence?: GoalRecurrence }
) {
  return {
    name,
    targetAmount: target,
    currentAmount: current,
    current_amount: current,
    target_amount: target,
    deadline: options?.deadline,
    recurrence: options?.recurrence ?? "none",
    format,
    color: getNextColor(index),
  };
}

const endOfYear = new Date(
  new Date().getFullYear(),
  11,
  31,
  23,
  59,
  59
).getTime();

const demoGoals = [
  createDemoGoal("Complete 50 clicks on the button", 36, 50, "number", 8, {}),
  createDemoGoal("Save for a trip", 7200, 5000, "currency", 3, {}),
  createDemoGoal("Walk 1000 steps", 670, 1000, "number", 4, {
    recurrence: "daily",
  }),
  createDemoGoal("Read 24 books", 24, 24, "number", 2, {
    recurrence: "yearly",
  }),
  createDemoGoal("Launch a startup", 41000, 50000, "currency", 6, {
    deadline: endOfYear,
  }),
];

export function Hero() {
  return (
    <section className="relative pt-24 pb-8 md:pt-32 md:pb-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full bg-green-500/10 dark:bg-green-500/[0.07] blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/8 dark:bg-emerald-500/[0.05] blur-[100px] animate-pulse-glow animation-delay-600" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Headline */}
          <h1 className="animate-fade-up animation-delay-150 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]">
            Track your goals. <span className="text-gradient">Ascent.</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up animation-delay-300 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Set financial goals, fitness targets, reading challenges, and more.
            Watch your progress climb with beautiful visual charts.
          </p>

          {/* CTA */}
          <div className="animate-fade-up animation-delay-450">
            <HeroButtons />
          </div>
        </div>

        {/* Demo goals */}
        <div className="mt-16 md:mt-20 animate-fade-up animation-delay-600">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Visitors />
            <InteractiveDemoGoal goal={demoGoals[0]} />
            {demoGoals.slice(1).map((goal, i) => (
              <GoalProgressDisplay key={i} goal={goal} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
