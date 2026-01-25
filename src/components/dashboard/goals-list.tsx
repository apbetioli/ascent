"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useRealtimeBoardGoals } from "@/lib/hooks";
import type { Tables } from "@/lib/supabase/types";
import { Target } from "lucide-react";
import { GoalCard } from "./goal-card";

interface GoalsListProps {
  goals: Tables<"goals">[];
  boardId: string;
}

export function GoalsList({ goals: initialGoals, boardId }: GoalsListProps) {
  // Subscribe to real-time updates for all goals on this board
  const goals = useRealtimeBoardGoals(boardId, initialGoals);

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

  // Sort by sort_order
  const sortedGoals = [...goals].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedGoals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
