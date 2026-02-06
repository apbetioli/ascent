import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import { getNextColor } from "@/lib/utils/colors";
import {
  Calendar,
  Share2,
  Code,
  Zap,
  Repeat,
  Globe,
  type LucideIcon,
} from "lucide-react";

function createFeatureGoal(
  name: string,
  current: number,
  target: number,
  format: "number" | "currency",
  colorIndex: number,
  options?: { deadline?: number; recurrence?: string }
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
    color: getNextColor(colorIndex),
  };
}

const endOfMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  0,
  23,
  59,
  59
).getTime();

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  goals: ReturnType<typeof createFeatureGoal>[];
}

const features: Feature[] = [
  {
    icon: Repeat,
    title: "Recurring goals that reset automatically",
    description:
      "Set daily, weekly, monthly, or yearly recurring goals. Progress resets each period so you stay on track — every single week, month, or year.",
    goals: [
      createFeatureGoal("Weekly workout sessions", 4, 5, "number", 0, {
        recurrence: "weekly",
      }),
      createFeatureGoal("Monthly savings target", 1800, 2000, "currency", 5, {
        recurrence: "monthly",
      }),
    ],
  },
  {
    icon: Calendar,
    title: "Due dates that keep you accountable",
    description:
      "Set deadlines for your goals and see exactly how many days are left. Never miss a target date with visual countdown tracking.",
    goals: [
      createFeatureGoal("Marathon training plan", 24, 42, "number", 3, {
        deadline: endOfMonth,
      }),
      createFeatureGoal("Book launch prep", 11, 12, "number", 7, {
        deadline: new Date().getTime(),
      }),
    ],
  },
  {
    icon: Share2,
    title: "Share your progress publicly",
    description:
      "Create a public board with a unique link. Perfect for accountability, building in public, or showing off achievements to your audience.",
    goals: [
      createFeatureGoal("Revenue goal", 72000, 100000, "currency", 6, {}),
      createFeatureGoal("Users acquired", 1240, 1000, "number", 4, {}),
    ],
  },
  {
    icon: Code,
    title: "Embed widgets anywhere",
    description:
      "Embed goal widgets on your website, blog, or Notion page. Show real-time progress anywhere with a simple iframe embed code.",
    goals: [
      createFeatureGoal("Blog subscribers", 847, 1000, "number", 1, {}),
      createFeatureGoal("Course completion", 18, 24, "number", 2, {}),
    ],
  },
  {
    icon: Zap,
    title: "Automate with the API",
    description:
      "Update goals programmatically via our API. Connect with AI Agents, write scripts, or integrate with any tool that makes HTTP requests.",
    goals: [
      createFeatureGoal("Steps tracked", 8432, 10000, "number", 5, {
        recurrence: "daily",
      }),
      createFeatureGoal("Commits this week", 23, 20, "number", 9, {
        recurrence: "weekly",
      }),
    ],
  },
  {
    icon: Globe,
    title: "Real-time updates everywhere",
    description:
      "See changes instantly across all devices. Update from your phone and see it reflected on your desktop — or your public board — immediately.",
    goals: [
      createFeatureGoal("Savings fund", 15400, 20000, "currency", 4, {}),
      createFeatureGoal("Reading challenge", 31, 52, "number", 7, {
        recurrence: "yearly",
      }),
    ],
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-3 tracking-wide uppercase">
            Features
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
            Everything you need to{" "}
            <span className="text-gradient">succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful goal tracking wrapped in a simple, beautiful interface.
          </p>
        </div>

        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={feature.title}
                className={`flex flex-col ${isReversed ? "md:flex-row-reverse bg-muted/50" : "md:flex-row border"} items-center gap-12 md:gap-16 p-8 rounded-xl`}
              >
                {/* Text side */}
                <div className="flex-1 space-y-5">
                  {/* <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/15">
                    <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div> */}
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Demo goals side */}
                <div className="flex-1 w-full space-y-4">
                  {feature.goals.map((goal, i) => (
                    <GoalProgressDisplay key={i} goal={goal} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
