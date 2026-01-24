"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Calendar,
  Repeat,
  TrendingDown,
} from "lucide-react";
import { formatDeadlineStatus, calculateProgressPercentage } from "@/lib/utils/progress";
import { EditGoalDialog } from "./edit-goal-dialog";
import { AddRecordDialog } from "./add-record-dialog";
import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import type { Tables } from "@/lib/supabase/types";

interface GoalCardProps {
  goal: Tables<"goals">;
  boardId: string;
  timezone: string;
}

export function GoalCard({ goal, boardId, timezone }: GoalCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Update current time periodically to check for overdue deadlines
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const percentage = calculateProgressPercentage(
    goal.current_amount,
    goal.target_amount,
    goal.is_reverse
  );

  const isComplete = goal.is_reverse
    ? percentage <= 0
    : percentage >= 100;

  const deadlineStatus = formatDeadlineStatus(goal.deadline);
  const isOverdue = goal.deadline && goal.deadline < currentTime && !isComplete;

  const handleDelete = async () => {
    setIsDeleting(true);

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goal.id);

    if (error) {
      toast.error("Failed to delete goal");
      setIsDeleting(false);
      return;
    }

    toast.success("Goal deleted");
    setShowDeleteDialog(false);
    router.refresh();
  };

  const customHeader = (
    <div className="flex items-start justify-between">
      <div className="space-y-1 flex-1 pr-8">
        <CardTitle className="text-lg leading-tight">{goal.name}</CardTitle>
        <CardDescription className="flex flex-wrap gap-2 text-xs">
          {goal.recurrence !== "none" && (
            <span className="flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              {goal.recurrence}
            </span>
          )}
          {goal.is_reverse && (
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Reverse
            </span>
          )}
          {deadlineStatus && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? "text-destructive" : ""
              }`}
            >
              <Calendar className="h-3 w-3" />
              {deadlineStatus}
            </span>
          )}
        </CardDescription>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowAddRecordDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Goal
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Goal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <>
      <GoalProgressDisplay
        goal={{
          name: goal.name,
          current_amount: goal.current_amount,
          target_amount: goal.target_amount,
          is_reverse: goal.is_reverse,
          deadline: goal.deadline,
          color: goal.color,
        }}
        customHeader={customHeader}
        badgePosition="header"
        cardClassName="relative overflow-hidden transition-all hover:shadow-md"
        footer={
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowAddRecordDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Progress
          </Button>
        }
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{goal.name}&quot;? This will
              also delete all records for this goal. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditGoalDialog
        goal={goal}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AddRecordDialog
        goalId={goal.id}
        goalName={goal.name}
        open={showAddRecordDialog}
        onOpenChange={setShowAddRecordDialog}
      />
    </>
  );
}
