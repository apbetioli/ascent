"use client";

import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type GoalRecurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

type DemoGoal = {
  name: string;
  targetAmount: number;
  currentAmount: number;
  current_amount: number;
  target_amount: number;
  deadline?: number;
  recurrence: GoalRecurrence;
  format: "number" | "currency";
  color: string;
};

const STEP = 1;

interface InteractiveDemoGoalProps {
  goal: DemoGoal;
  /** Amount to add per click (default 10) */
  step?: number;
}

export function InteractiveDemoGoal({
  goal: initialGoal,
  step = STEP,
}: InteractiveDemoGoalProps) {
  const [currentAmount, setCurrentAmount] = useState(initialGoal.currentAmount);
  const targetAmount = initialGoal.targetAmount;
  const isComplete = currentAmount >= targetAmount;

  const goal: DemoGoal = {
    ...initialGoal,
    currentAmount,
    current_amount: currentAmount,
  };

  const addProgress = () => {
    setCurrentAmount((prev) => Math.min(targetAmount, prev + step));
  };

  const label = "Click me!";

  return (
    <GoalProgressDisplay
      goal={goal}
      footer={
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-2"
          onClick={(e) => {
            e.stopPropagation();
            addProgress();
          }}
          disabled={isComplete}
          aria-label={label}
        >
          {label}
        </Button>
      }
    />
  );
}
