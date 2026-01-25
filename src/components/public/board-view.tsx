"use client";

import { useRealtimeBoardGoals } from "@/lib/hooks";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";
import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";

interface PublicBoardViewProps {
  board: Tables<"boards">;
  goals: Tables<"goals">[];
}

export function PublicBoardView({
  board,
  goals: initialGoals,
}: PublicBoardViewProps) {
  const goals = useRealtimeBoardGoals(board.id, initialGoals);

  const sortedGoals = [...goals].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      {sortedGoals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No goals yet</CardTitle>
          <CardDescription>This board has no goals.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedGoals.map((goal) => (
            <GoalProgressDisplay
              key={goal.id}
              goal={goal}
              cardClassName="relative overflow-hidden transition-all hover:shadow-md"
            />
          ))}
        </div>
      )}
    </div>
  );
}
