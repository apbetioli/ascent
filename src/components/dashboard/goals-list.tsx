"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Target } from "lucide-react";
import { GoalCard } from "./goal-card";

interface GoalsListProps {
  boardId: Id<"boards">;
}

export function GoalsList({ boardId }: GoalsListProps) {
  const goals = useQuery(api.goals.listGoalsByBoard, { boardId }) ?? [];

  if (goals.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <Target className="h-12 w-12 text-muted-foreground mb-4" />
        <CardTitle className="mb-2">No goals yet</CardTitle>
        <CardDescription>
          Create your first goal to start tracking your progress
        </CardDescription>
      </Card>
    );
  }

  const sortedGoals = [...goals].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedGoals.map((goal) => (
        <GoalCard key={goal._id} goal={goal} boardId={boardId} />
      ))}
    </div>
  );
}
