"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  getFirstCollision,
  useDroppable,
  type CollisionDetection,
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
import type { ConvexBoard, ConvexGoal } from "@/lib/convex-types";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Plus, Target } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface SortableGoalCardProps {
  goal: ConvexGoal;
  boardId: Id<"boards">;
}

function SortableGoalCard({ goal, boardId }: SortableGoalCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id: goal._id,
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
      <GoalCard goal={goal} boardId={boardId} />
    </div>
  );
}

interface BoardColumnProps {
  board: ConvexBoard;
  onGoalsLoad?: (boardId: Id<"boards">, goals: ConvexGoal[]) => void;
}

function BoardColumn({ board, onGoalsLoad }: BoardColumnProps) {
  const goals =
    useQuery(api.goals.listGoalsByBoard, { boardId: board._id }) ?? [];
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const sortedGoals = useMemo(
    () => [...goals].sort((a, b) => a.sortOrder - b.sortOrder),
    [goals]
  );

  useEffect(() => {
    onGoalsLoad?.(board._id, sortedGoals);
  }, [board._id, sortedGoals, onGoalsLoad]);

  const goalIds = sortedGoals.map((g) => g._id);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: board._id,
    data: { type: "board" as const },
  });

  return (
    <div className="flex w-[340px] min-w-[340px] max-w-[340px] shrink-0 flex-col rounded-lg border bg-card">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
        <Link
          href={`/boards/${board._id}`}
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
            boardId={board._id}
            existingGoalsCount={goals.length}
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            hideDefaultTrigger
          />
          <BoardOptionsMenu board={board} align="end" />
        </div>
      </div>
      <div
        ref={setDroppableRef}
        className={`max-h-[calc(100dvh-12rem)] min-h-0 overflow-y-auto overflow-x-hidden transition-colors ${
          isOver ? "bg-muted/50" : ""
        }`}
      >
        <div className="flex flex-col gap-2 p-3 min-w-0 min-h-[120px]">
          {sortedGoals.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-6">
              <Target className="mb-0 h-10 w-10 text-muted-foreground" />
              <CardTitle className="mb-0 text-sm">No goals yet</CardTitle>
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
                  key={goal._id}
                  goal={goal}
                  boardId={board._id}
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
  boards: ConvexBoard[];
  className?: string;
}

export function BoardsTrelloView({ boards, className }: BoardsTrelloViewProps) {
  const boardIds = useMemo(() => boards.map((b) => b._id), [boards]);
  const [goalsByBoardId, setGoalsByBoardId] = useState<
    Record<string, ConvexGoal[]>
  >({});
  const [activeId, setActiveId] = useState<Id<"goals"> | null>(null);
  const userId = useQuery(api.profiles.getCurrentUserId);
  const updateGoal = useMutation(api.goals.updateGoal);

  const onGoalsLoad = useCallback(
    (boardId: Id<"boards">, goals: ConvexGoal[]) => {
      setGoalsByBoardId((prev) => ({ ...prev, [boardId]: goals }));
    },
    []
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const activeGoal = useMemo(() => {
    if (!activeId) return null;
    for (const goals of Object.values(goalsByBoardId)) {
      const goal = goals.find((g) => g._id === activeId);
      if (goal) return goal;
    }
    return null;
  }, [activeId, goalsByBoardId]);

  const findBoardIdForGoal = useCallback(
    (goalId: Id<"goals">): Id<"boards"> | null => {
      for (const [boardId, goals] of Object.entries(goalsByBoardId)) {
        if (goals.some((g) => g._id === goalId)) return boardId as Id<"boards">;
      }
      return null;
    },
    [goalsByBoardId]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as Id<"goals">);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over || !userId) return;

      const activeIdStr = active.id as Id<"goals">;
      const overIdStr = over.id as Id<"goals"> | Id<"boards">;
      const sourceBoardId =
        (active.data.current as { boardId?: Id<"boards"> } | undefined)
          ?.boardId ?? findBoardIdForGoal(activeIdStr);

      if (!sourceBoardId) return;

      const isOverBoard = boardIds.includes(overIdStr as Id<"boards">);
      const targetBoardId = isOverBoard
        ? (overIdStr as Id<"boards">)
        : findBoardIdForGoal(overIdStr as Id<"goals">);
      if (!targetBoardId) return;

      const sourceGoals = goalsByBoardId[sourceBoardId] ?? [];
      const targetGoals = goalsByBoardId[targetBoardId] ?? [];

      let newIndex: number;
      if (isOverBoard) {
        newIndex = targetGoals.length;
      } else {
        const overIndex = targetGoals.findIndex((g) => g._id === overIdStr);
        newIndex = overIndex >= 0 ? overIndex : targetGoals.length;
      }

      if (sourceBoardId === targetBoardId) {
        const oldIndex = sourceGoals.findIndex((g) => g._id === activeIdStr);
        if (oldIndex === -1 || oldIndex === newIndex) return;
        const reordered = arrayMove(sourceGoals, oldIndex, newIndex);
        try {
          await Promise.all(
            reordered.map((goal, index) => {
              if (goal.sortOrder === index) return Promise.resolve();
              return updateGoal({
                goalId: goal._id,
                userId,
                sortOrder: index,
              });
            })
          );
        } catch {
          // Failed to update order
        }
      } else {
        const movedGoal = sourceGoals.find((g) => g._id === activeIdStr);
        if (!movedGoal) return;

        setGoalsByBoardId((prev) => {
          const next = { ...prev };
          next[sourceBoardId] = (next[sourceBoardId] ?? []).filter(
            (g) => g._id !== activeIdStr
          );
          const newGoal = {
            ...movedGoal,
            boardId: targetBoardId,
            sortOrder: newIndex,
          };
          const targetList = [...(next[targetBoardId] ?? [])];
          targetList.splice(newIndex, 0, newGoal);
          next[targetBoardId] = targetList.map((g, i) => ({
            ...g,
            sortOrder: i,
          }));
          return next;
        });

        try {
          await Promise.all([
            ...targetGoals
              .filter((g) => g.sortOrder >= newIndex)
              .map((g) =>
                updateGoal({
                  goalId: g._id,
                  userId,
                  sortOrder: g.sortOrder + 1,
                })
              ),
            updateGoal({
              goalId: activeIdStr,
              userId,
              boardId: targetBoardId,
              sortOrder: newIndex,
            }),
          ]);
        } catch {
          setGoalsByBoardId((prev) => {
            const next = { ...prev };
            next[sourceBoardId] = sourceGoals;
            next[targetBoardId] = targetGoals;
            return next;
          });
        }
      }
    },
    [boardIds, goalsByBoardId, findBoardIdForGoal, updateGoal, userId]
  );

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const pointerIntersections = rectIntersection(args);
      let overId = getFirstCollision(pointerIntersections, "id");
      if (
        overId != null &&
        typeof overId === "string" &&
        overId in goalsByBoardId
      ) {
        const containerItems = (goalsByBoardId[overId] ?? []).map((g) => g._id);
        if (containerItems.length > 0) {
          const refined = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (c: { id: unknown }) =>
                c.id !== overId && containerItems.includes(c.id as Id<"goals">)
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
                key={board._id}
                board={board}
                onGoalsLoad={onGoalsLoad}
              />
            ))}
          </div>
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeGoal ? (
          <div className="w-[316px] shrink-0 cursor-grabbing opacity-90 shadow-lg">
            <GoalCard goal={activeGoal} boardId={activeGoal.boardId} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
