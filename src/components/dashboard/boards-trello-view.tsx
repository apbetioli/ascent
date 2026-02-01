"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoardOptionsMenu } from "@/components/dashboard/board-options-menu";
import { CreateGoalDialog } from "@/components/dashboard/create-goal-dialog";
import { GoalCard } from "@/components/dashboard/goal-card";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { useRealtimeBoardGoals } from "@/lib/hooks";
import { useSupabase } from "@/lib/hooks/use-supabase";
import type { Tables } from "@/lib/supabase/types";
import { Plus, Target } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SortableGoalCardProps {
  goal: Tables<"goals">;
}

function SortableGoalCard({ goal }: SortableGoalCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id: goal.id,
      transition: null,
    });
  const justFinishedDragRef = useRef(false);
  const wasDraggingRef = useRef(false);

  useEffect(() => {
    if (isDragging) {
      wasDraggingRef.current = true;
    } else {
      if (wasDraggingRef.current) {
        justFinishedDragRef.current = true;
        wasDraggingRef.current = false;
      }
    }
  }, [isDragging]);

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (justFinishedDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
      justFinishedDragRef.current = false;
    }
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "none",
    visibility: isDragging ? ("hidden" as const) : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="shrink-0 cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
      onClickCapture={handleClickCapture}
    >
      <GoalCard goal={goal} />
    </div>
  );
}

interface BoardColumnProps {
  board: Tables<"boards">;
  initialGoals: Tables<"goals">[];
}

function BoardColumn({ board, initialGoals }: BoardColumnProps) {
  const goals = useRealtimeBoardGoals(board.id, initialGoals);
  const { updateGoal } = useSupabase();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [optimisticOrder, setOptimisticOrder] = useState<string[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sortedGoals = useMemo(() => {
    if (optimisticOrder?.length) {
      const byId = new Map(goals.map((g) => [g.id, g]));
      const ordered: Tables<"goals">[] = [];
      for (const id of optimisticOrder) {
        const g = byId.get(id);
        if (g) ordered.push(g);
      }
      for (const g of goals) {
        if (!optimisticOrder.includes(g.id)) ordered.push(g);
      }
      return ordered;
    }
    return [...goals].sort((a, b) => a.sort_order - b.sort_order);
  }, [goals, optimisticOrder]);

  const goalIds = sortedGoals.map((g) => g.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over || active.id === over.id) return;
      const oldIndex = goalIds.indexOf(active.id as string);
      const newIndex = goalIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(sortedGoals, oldIndex, newIndex);
      const newOrderIds = reordered.map((g) => g.id);
      setOptimisticOrder(newOrderIds);
      try {
        await Promise.all(
          reordered.map((goal, index) => {
            if (goal.sort_order === index) return Promise.resolve();
            return updateGoal(goal.id, { sort_order: index });
          })
        );
        toast.success("Order updated");
      } catch {
        toast.error("Failed to update order");
      } finally {
        setTimeout(() => setOptimisticOrder(null), 800);
      }
    },
    [goalIds, sortedGoals, updateGoal]
  );

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
      <div className="max-h-[calc(100dvh-12rem)] min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-2 p-3 min-w-0">
          {sortedGoals.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-8">
              <Target className="mb-2 h-10 w-10 text-muted-foreground" />
              <CardTitle className="mb-1 text-sm">No goals yet</CardTitle>
              <CardDescription className="text-center text-xs">
                Use + to add a goal
              </CardDescription>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={goalIds}
                strategy={verticalListSortingStrategy}
              >
                {sortedGoals.map((goal) => (
                  <SortableGoalCard key={goal.id} goal={goal} />
                ))}
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {activeId
                  ? (() => {
                      const goal = sortedGoals.find((g) => g.id === activeId);
                      return goal ? (
                        <div className="w-[316px] shrink-0 cursor-grabbing opacity-90 shadow-lg">
                          <GoalCard goal={goal} />
                        </div>
                      ) : null;
                    })()
                  : null}
              </DragOverlay>
            </DndContext>
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
