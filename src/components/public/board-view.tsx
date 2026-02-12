"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AscentIcon } from "@/components/ui/ascent-icon";
import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import type { ConvexBoard, ConvexGoal } from "@/lib/convex-types";

interface PublicBoardViewProps {
  board: ConvexBoard;
  goals: ConvexGoal[];
}

export function PublicBoardView({
  board,
  goals: initialGoals,
}: PublicBoardViewProps) {
  const goals =
    useQuery(api.goals.listGoalsByBoard, { boardId: board._id }) ??
    initialGoals;

  const sortedGoals = [...goals].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      {sortedGoals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <AscentIcon className="mb-4 h-12 w-12" />
          <CardTitle className="mb-2">No goals yet</CardTitle>
          <CardDescription>This board has no goals.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedGoals.map((goal) => (
            <GoalProgressDisplay
              key={goal._id}
              goal={goal}
              cardClassName="relative overflow-hidden transition-all hover:shadow-md"
            />
          ))}
        </div>
      )}
    </div>
  );
}
