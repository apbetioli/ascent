"use client";

import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AddRecordDialog } from "./add-record-dialog";
import { CreateGoalDialog } from "./create-goal-dialog";

interface GoalCardProps {
  goal: Tables<"goals">;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setIsDeleting(true);

    const { error } = await supabase.from("goals").delete().eq("id", goal.id);

    if (error) {
      toast.error("Failed to delete goal");
      setIsDeleting(false);
      return;
    }

    toast.success("Goal deleted");
    setShowDeleteDialog(false);
    router.refresh();
  };

  const contextMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setShowAddRecordDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Progress
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
  );

  return (
    <>
      <GoalProgressDisplay
        goal={goal}
        contextMenu={contextMenu}
        cardClassName="relative overflow-hidden transition-all hover:shadow-md"
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

      <CreateGoalDialog
        boardId={goal.board_id}
        existingGoalsCount={0}
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
