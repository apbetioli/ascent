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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabase } from "@/lib/hooks/use-supabase";
import type { Tables } from "@/lib/supabase/types";
import { Code, Copy, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CreateGoalDialog } from "./create-goal-dialog";

interface GoalCardProps {
  goal: Tables<"goals">;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const { getUser, createRecord, deleteGoal } = useSupabase();

  const handleCopyEmbedCode = () => {
    const embedCode = `<iframe src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${goal.embed_id}" width="400" height="200" frameborder="0" style="border-radius: 8px;"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard!");
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteGoal(goal.id);
      toast.success("Goal deleted");
      setShowDeleteDialog(false);
      setShowEditDialog(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete goal");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlusOne = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const user = await getUser();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    try {
      await createRecord({
        goal_id: goal.id,
        user_id: user.id,
        amount: 1,
        description: null,
        timestamp: Date.now(),
      });
      toast.success("Progress added");
      router.refresh();
    } catch (error) {
      toast.error("Failed to add progress");
      console.error(error);
    }
  };

  const contextMenu = (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={handlePlusOne}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Add 1</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right">
          <DropdownMenuItem onClick={() => setShowEmbedDialog(true)}>
            <Code className="mr-2 h-4 w-4" />
            Embed Goal
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
    </>
  );

  return (
    <>
      <GoalProgressDisplay
        goal={goal}
        contextMenu={contextMenu}
        cardClassName="relative overflow-hidden transition-all hover:shadow-md"
        contextMenuHoverOnly
        onCardClick={() => setShowEditDialog(true)}
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
        onEmbedClick={() => setShowEmbedDialog(true)}
        onDeleteClick={() => setShowDeleteDialog(true)}
      />

      <Dialog open={showEmbedDialog} onOpenChange={setShowEmbedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed Goal Widget</DialogTitle>
            <DialogDescription>
              Copy the code below to embed this goal on your website.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <code className="text-xs break-all">
                {`<iframe src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${goal.embed_id}" width="400" height="200" frameborder="0" style="border-radius: 8px;"></iframe>`}
              </code>
            </div>
            <Button onClick={handleCopyEmbedCode} className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copy Embed Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
