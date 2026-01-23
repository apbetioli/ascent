"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Trophy,
  Sparkles,
} from "lucide-react";
import {
  calculateProgressPercentage,
  formatDeadlineStatus,
} from "@/lib/utils/progress";
import { EditGoalDialog } from "./edit-goal-dialog";
import { AddRecordDialog } from "./add-record-dialog";
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
  const router = useRouter();
  const supabase = createClient();

  const percentage = calculateProgressPercentage(
    goal.current_amount,
    goal.target_amount,
    goal.is_reverse
  );

  const isSurpassed = goal.is_reverse
    ? percentage <= 0
    : percentage > 100;

  const isComplete = goal.is_reverse
    ? percentage <= 0
    : percentage >= 100;

  const deadlineStatus = formatDeadlineStatus(goal.deadline);
  const isOverdue = goal.deadline && goal.deadline < Date.now() && !isComplete;

  const remaining = goal.is_reverse
    ? goal.current_amount
    : Math.max(0, goal.target_amount - goal.current_amount);

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

  const formatAmount = (amount: number) => {
    // Check if it's a monetary value (has decimals or is large)
    if (amount >= 100 || amount % 1 !== 0) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return amount.toLocaleString();
  };

  return (
    <>
      <Card
        className="relative overflow-hidden transition-all hover:shadow-md"
        style={{
          borderTopColor: goal.color,
          borderTopWidth: "3px",
        }}
      >
        {isSurpassed && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="default"
              className="bg-yellow-500 text-yellow-950 gap-1"
            >
              <Trophy className="h-3 w-3" />
              Surpassed!
            </Badge>
          </div>
        )}
        {isComplete && !isSurpassed && (
          <div className="absolute top-2 right-2">
            <Badge variant="default" className="bg-green-500 gap-1">
              <Sparkles className="h-3 w-3" />
              Complete!
            </Badge>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 pr-8">
              <CardTitle className="text-lg leading-tight">
                {goal.name}
              </CardTitle>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
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
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {Math.min(Math.round(percentage), 100)}%
                {isSurpassed && ` (${Math.round(percentage)}%)`}
              </span>
            </div>
            <Progress
              value={Math.min(percentage, 100)}
              className="h-2"
              style={
                {
                  "--progress-background": goal.color,
                } as React.CSSProperties
              }
            />
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Current: </span>
              <span className="font-medium">
                {formatAmount(goal.current_amount)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Target: </span>
              <span className="font-medium">
                {formatAmount(goal.target_amount)}
              </span>
            </div>
          </div>

          {!isComplete && (
            <div className="text-sm text-muted-foreground">
              {goal.is_reverse
                ? `${formatAmount(remaining)} spent`
                : `${formatAmount(remaining)} remaining`}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowAddRecordDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Progress
          </Button>
        </CardContent>
      </Card>

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
