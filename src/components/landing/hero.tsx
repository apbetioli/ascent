import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/supabase/types";
import { getNextColor } from "@/lib/utils/colors";
import { Sparkles } from "lucide-react";
import { HeroButtons } from "./hero-buttons";
import Visitors from "./visitors";

type GoalRecurrence = Tables<"goals">["recurrence"];

function createDemoGoal(
  name: string,
  current: number,
  target: number,
  format: "number" | "currency",
  index: number,
  options?: { deadline?: number; recurrence?: GoalRecurrence }
): Tables<"goals"> {
  return {
    id: `demo-${index}`,
    embed_id: "demo",
    board_id: "demo",
    user_id: "demo",
    name,
    target_amount: target,
    current_amount: current,
    deadline: options?.deadline ?? null,
    recurrence: options?.recurrence ?? "none",
    format,
    color: getNextColor(index),
    sort_order: index,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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

const perfectForGoals: Tables<"goals">[] = [
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
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
            Track Your Goals,{" "}
            <span className="text-primary">Achieve Your Dreams</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl">
            Set financial goals, fitness targets, reading challenges, and more.
            Watch your progress with stunning visual charts.
          </p>

          <HeroButtons />

          <div className="w-full mt-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              <Visitors />
              {perfectForGoals.map((goal) => (
                <GoalProgressDisplay key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
