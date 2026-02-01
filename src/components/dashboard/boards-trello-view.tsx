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
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  useDroppable,
  type CollisionDetection,
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
  boardId: string;
}

function SortableGoalCard({ goal, boardId }: SortableGoalCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id: goal.id,
      data: { type: "goal" as const, boardId },
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
  onGoalsChange: (boardId: string, goals: Tables<"goals">[]) => void;
}

function BoardColumn({ board, initialGoals, onGoalsChange }: BoardColumnProps) {
  const goals = useRealtimeBoardGoals(board.id, initialGoals);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const sortedGoals = useMemo(
    () => [...goals].sort((a, b) => a.sort_order - b.sort_order),
    [goals]
  );

  const goalIds = sortedGoals.map((g) => g.id);

  useEffect(() => {
    onGoalsChange(board.id, sortedGoals);
  }, [board.id, sortedGoals, onGoalsChange]);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: board.id,
    data: { type: "board" as const },
  });

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
      <div
        ref={setDroppableRef}
        className={`max-h-[calc(100dvh-12rem)] min-h-0 overflow-y-auto overflow-x-hidden transition-colors ${
          isOver ? "bg-muted/50" : ""
        }`}
      >
        <div className="flex flex-col gap-2 p-3 min-w-0 min-h-[120px]">
          {sortedGoals.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-8">
              <Target className="mb-2 h-10 w-10 text-muted-foreground" />
              <CardTitle className="mb-1 text-sm">No goals yet</CardTitle>
              <CardDescription className="text-center text-xs">
                Use + to add a goal or drag one here
              </CardDescription>
            </Card>
          ) : (
            <SortableContext
              items={goalIds}
              strategy={verticalListSortingStrategy}
            >
              {sortedGoals.map((goal) => (
                <SortableGoalCard
                  key={goal.id}
                  goal={goal}
                  boardId={board.id}
                />
              ))}
            </SortableContext>
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
  goalsByBoardId: initialGoalsByBoardId,
  className,
}: BoardsTrelloViewProps) {
  const boardIds = useMemo(() => boards.map((b) => b.id), [boards]);
  const [goalsByBoardId, setGoalsByBoardId] = useState<
    Record<string, Tables<"goals">[]>
  >(initialGoalsByBoardId);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { updateGoal } = useSupabase();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const onGoalsChange = useCallback(
    (boardId: string, goals: Tables<"goals">[]) => {
      setGoalsByBoardId((prev) => {
        const current = prev[boardId] ?? [];
        if (
          current.length === goals.length &&
          current.every((g, i) => goals[i]?.id === g.id)
        ) {
          return prev;
        }
        return { ...prev, [boardId]: goals };
      });
    },
    []
  );

  const activeGoal = useMemo(() => {
    if (!activeId) return null;
    for (const goals of Object.values(goalsByBoardId)) {
      const goal = goals.find((g) => g.id === activeId);
      if (goal) return goal;
    }
    return null;
  }, [activeId, goalsByBoardId]);

  const findBoardIdForGoal = useCallback(
    (goalId: string): string | null => {
      for (const [boardId, goals] of Object.entries(goalsByBoardId)) {
        if (goals.some((g) => g.id === goalId)) return boardId;
      }
      return null;
    },
    [goalsByBoardId]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const activeIdStr = active.id as string;
      const overIdStr = over.id as string;
      const sourceBoardId =
        (active.data.current as { boardId?: string } | undefined)?.boardId ??
        findBoardIdForGoal(activeIdStr);

      if (!sourceBoardId) return;

      const isOverBoard = boardIds.includes(overIdStr);
      const targetBoardId = isOverBoard
        ? overIdStr
        : findBoardIdForGoal(overIdStr);
      if (!targetBoardId) return;

      const sourceGoalIds =
        goalsByBoardId[sourceBoardId]?.map((g) => g.id) ?? [];
      const targetGoalIds =
        goalsByBoardId[targetBoardId]?.map((g) => g.id) ?? [];

      let newIndex: number;
      if (isOverBoard) {
        newIndex = targetGoalIds.length;
      } else {
        const overIndex = targetGoalIds.indexOf(overIdStr);
        newIndex = overIndex >= 0 ? overIndex : targetGoalIds.length;
      }

      if (sourceBoardId === targetBoardId) {
        const oldIndex = sourceGoalIds.indexOf(activeIdStr);
        if (oldIndex === -1 || oldIndex === newIndex) return;
        const sourceGoals = goalsByBoardId[sourceBoardId] ?? [];
        const reordered = arrayMove(sourceGoals, oldIndex, newIndex);
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
        }
      } else {
        const sourceGoals = goalsByBoardId[sourceBoardId] ?? [];
        const targetGoals = goalsByBoardId[targetBoardId] ?? [];
        const movedGoal = sourceGoals.find((g) => g.id === activeIdStr);
        if (!movedGoal) return;

        // Optimistic update: move goal in UI immediately
        setGoalsByBoardId((prev) => {
          const next = { ...prev };
          next[sourceBoardId] = (next[sourceBoardId] ?? []).filter(
            (g) => g.id !== activeIdStr
          );
          const newGoal = {
            ...movedGoal,
            board_id: targetBoardId,
            sort_order: newIndex,
          };
          const targetList = [...(next[targetBoardId] ?? [])];
          targetList.splice(newIndex, 0, newGoal);
          next[targetBoardId] = targetList.map((g, i) => ({
            ...g,
            sort_order: i,
          }));
          return next;
        });

        try {
          await Promise.all([
            ...targetGoals
              .filter((g) => g.sort_order >= newIndex)
              .map((g) => updateGoal(g.id, { sort_order: g.sort_order + 1 })),
            updateGoal(activeIdStr, {
              board_id: targetBoardId,
              sort_order: newIndex,
            }),
          ]);
          toast.success("Goal moved to board");
        } catch {
          toast.error("Failed to move goal");
          // Revert optimistic update on error
          setGoalsByBoardId((prev) => {
            const next = { ...prev };
            next[sourceBoardId] = sourceGoals;
            next[targetBoardId] = targetGoals;
            return next;
          });
        }
      }
    },
    [boardIds, goalsByBoardId, findBoardIdForGoal, updateGoal]
  );

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");
      if (
        overId != null &&
        typeof overId === "string" &&
        overId in goalsByBoardId
      ) {
        const containerItems = (goalsByBoardId[overId] ?? []).map((g) => g.id);
        if (containerItems.length > 0) {
          const refined = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (c: { id: unknown }) =>
                c.id !== overId && containerItems.includes(c.id as string)
            ),
          });
          const first = getFirstCollision(refined, "id");
          if (first != null) overId = first;
        }
      }
      return overId != null ? [{ id: overId }] : [];
    },
    [goalsByBoardId]
  );

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
    <DndContext
      id="boards-trello-dnd"
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`flex min-h-0 flex-col overflow-hidden ${className ?? ""}`}
      >
        <div className="min-h-0 w-full flex-1 overflow-x-auto overflow-y-hidden">
          <div className="inline-flex items-start gap-4 px-4 pt-4 h-full">
            {boards.map((board) => (
              <BoardColumn
                key={board.id}
                board={board}
                initialGoals={[
                  ...(goalsByBoardId[board.id] ??
                    initialGoalsByBoardId[board.id] ??
                    []),
                ].sort((a, b) => a.sort_order - b.sort_order)}
                onGoalsChange={onGoalsChange}
              />
            ))}
          </div>
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeGoal ? (
          <div className="w-[316px] shrink-0 cursor-grabbing opacity-90 shadow-lg">
            <GoalCard goal={activeGoal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
