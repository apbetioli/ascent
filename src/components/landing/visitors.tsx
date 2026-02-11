"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";

const VISITOR_TARGET = 20;

export default function Visitors() {
  const visitorCount = useQuery(api.visitors.getLiveCount, {}) ?? 1;

  return (
    <GoalProgressDisplay
      showLiveIndicator
      goal={{
        name: "Online visitors (including you)",
        currentAmount: Math.max(visitorCount, 1),
        targetAmount: VISITOR_TARGET,
        current_amount: visitorCount,
        target_amount: VISITOR_TARGET,
        format: "number",
        deadline: undefined,
        color: "#3b82f6",
        recurrence: "none",
      }}
    />
  );
}
