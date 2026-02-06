"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import { APP_NAME } from "@/lib/app-name";
import type { ConvexGoal } from "@/lib/convex-types";

interface EmbedGoalWidgetProps {
  goal: ConvexGoal;
}

export function EmbedGoalWidget({ goal: initialGoal }: EmbedGoalWidgetProps) {
  const goal =
    useQuery(api.goals.getGoalByEmbedId, { embedId: initialGoal.embedId }) ??
    initialGoal;

  return (
    <GoalProgressDisplay
      goal={goal}
      cardClassName="w-full max-w-sm mx-auto overflow-hidden"
      footer={
        <p className="text-xs text-center text-muted-foreground pt-1 border-t">
          Powered by{" "}
          <a
            href={process.env.NEXT_PUBLIC_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {APP_NAME}
          </a>
        </p>
      }
    />
  );
}
