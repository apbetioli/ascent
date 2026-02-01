"use client";

import { BoardOptionsMenu } from "@/components/dashboard/board-options-menu";
import { CreateGoalDialog } from "@/components/dashboard/create-goal-dialog";
import { GoalCard } from "@/components/dashboard/goal-card";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useRealtimeBoardGoals } from "@/lib/hooks";
import type { Tables } from "@/lib/supabase/types";
import { Plus, Target } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BoardColumnProps {
  board: Tables<"boards">;
  initialGoals: Tables<"goals">[];
}

function BoardColumn({ board, initialGoals }: BoardColumnProps) {
  const goals = useRealtimeBoardGoals(board.id, initialGoals);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const sortedGoals = [...goals].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex w-[340px] min-w-[340px] max-w-[340px] shrink-0 flex-col rounded-lg border bg-card">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
        <Link
          href={`/boards/${board.id}`}
          className="min-w-0 flex-1 truncate font-semibold uppercase tracking-wide text-foreground hover:underline"
        >
          {board.name}
        </Link>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setAddDialogOpen(true)}
            aria-label="Add goal to list"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <CreateGoalDialog
            boardId={board.id}
            existingGoalsCount={goals.length}
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            hideDefaultTrigger
          />
          <BoardOptionsMenu board={board} align="end" />
        </div>
      </div>
      {/* List is content-sized up to max height, then scrolls inside column */}
      <div className="max-h-[calc(100dvh-12rem)] min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-2 p-3">
          {sortedGoals.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-8">
              <Target className="mb-2 h-10 w-10 text-muted-foreground" />
              <CardTitle className="mb-1 text-sm">No goals yet</CardTitle>
              <CardDescription className="text-center text-xs">
                Use + to add a goal
              </CardDescription>
            </Card>
          ) : (
            sortedGoals.map((goal) => (
              <div key={goal.id} className="shrink-0">
                <GoalCard goal={goal} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface BoardsTrelloViewProps {
  boards: Tables<"boards">[];
  goalsByBoardId: Record<string, Tables<"goals">[]>;
  className?: string;
}

export function BoardsTrelloView({
  boards,
  goalsByBoardId,
  className,
}: BoardsTrelloViewProps) {
  if (boards.length === 0) {
    return (
      <Card
        className={
          className
            ? `${className} flex flex-col items-center justify-center py-12`
            : "flex flex-col items-center justify-center py-12"
        }
      >
        <CardTitle className="mb-2">No boards yet</CardTitle>
        <CardDescription>
          Create your first board to start tracking goals
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden ${className ?? ""}`}>
      <div className="min-h-0 w-full flex-1 overflow-x-auto overflow-y-hidden">
        <div className="inline-flex items-start gap-4 px-4 pt-4 h-full">
          {boards.map((board) => (
            <BoardColumn
              key={board.id}
              board={board}
              initialGoals={[...(goalsByBoardId[board.id] ?? [])].sort(
                (a, b) => a.sort_order - b.sort_order
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
