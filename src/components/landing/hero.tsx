import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import { getNextColor } from "@/lib/utils/colors";
import { HeroButtons } from "./hero-buttons";
import Visitors from "./visitors";
import { APP_NAME } from "@/lib/app-name";

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
  createDemoGoal("Fitness and health goals", 67, 100, "number", 0, {
    recurrence: "weekly",
  }),
  createDemoGoal("Reading challenges", 24, 24, "number", 2, {
    recurrence: "monthly",
  }),
  createDemoGoal("Learning new skills", 32, 50, "number", 3, {}),
  createDemoGoal("Saving for a big purchase", 7200, 5000, "currency", 4, {}),
  createDemoGoal("Business milestones", 41000, 50000, "currency", 6, {
    deadline: endOfYear,
  }),
];

export function Hero() {
  return (
    <section className="relative pt-24 pb-8 md:pt-32 md:pb-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full bg-purple-500/10 dark:bg-purple-500/[0.07] blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-fuchsia-500/8 dark:bg-fuchsia-500/[0.05] blur-[100px] animate-pulse-glow animation-delay-600" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-sm text-purple-600 dark:text-purple-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
            </span>
            Track any goal. Achieve everything.
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up animation-delay-150 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]">
            Track your goals,{" "}
            <span className="text-gradient">achieve your dreams</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up animation-delay-300 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Set financial goals, fitness targets, reading challenges, and more.
            Watch your progress with beautiful visual charts. Used by{" "}
            <span className="font-semibold text-foreground">thousands</span> of goal-setters.
          </p>

          {/* CTA */}
          <div className="animate-fade-up animation-delay-450">
            <HeroButtons />
          </div>

          {/* Social proof line */}
          <p className="animate-fade-up animation-delay-600 text-sm text-muted-foreground">
            One-time payment &middot; Lifetime access &middot; 30-day money-back guarantee
          </p>
        </div>

        {/* Demo goals */}
        <div className="mt-16 md:mt-20 animate-fade-up animation-delay-600">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Visitors />
            {demoGoals.map((goal, i) => (
              <GoalProgressDisplay key={i} goal={goal} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
