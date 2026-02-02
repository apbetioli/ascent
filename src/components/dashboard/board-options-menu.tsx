"use client";

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
import type { ConvexBoard } from "@/lib/convex-types";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import {
  Copy,
  ExternalLink,
  Globe,
  Lock,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface BoardOptionsMenuProps {
  board: ConvexBoard;
  triggerClassName?: string;
  triggerVariant?: "ghost" | "outline";
  align?: "start" | "center" | "end";
}

export function BoardOptionsMenu({
  board,
  triggerClassName,
  triggerVariant = "ghost",
  align = "end",
}: BoardOptionsMenuProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const userId = useQuery(api.profiles.getCurrentUserId);
  const updateBoard = useMutation(api.boards.updateBoard);
  const deleteBoard = useMutation(api.boards.deleteBoard);

  const handleTogglePublic = async () => {
    if (!userId) return;
    try {
      await updateBoard({
        boardId: board._id,
        userId,
        isPublic: !board.isPublic,
      });
      toast.success(
        board.isPublic ? "Board is now private" : "Board is now public"
      );
      router.refresh();
    } catch (error) {
      toast.error("Failed to update board visibility");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    setIsDeleting(true);
    try {
      await deleteBoard({ boardId: board._id, userId });
      toast.success("Board deleted");
      router.push("/boards");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete board");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyPublicLink = () => {
    if (!board.publicSlug) return;
    const url = `${window.location.origin}/public/${board.publicSlug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied to clipboard");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={triggerVariant}
            size="icon"
            className={triggerClassName ?? "h-8 w-8 shrink-0"}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Board options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          <DropdownMenuItem onClick={handleTogglePublic}>
            {board.isPublic ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Make Private
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Make Public
              </>
            )}
          </DropdownMenuItem>
          {board.isPublic && board.publicSlug && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyPublicLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Public Link
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/public/${board.publicSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public Page
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Board
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{board.name}&quot;? This
              will also delete all goals and records in this board. This action
              cannot be undone.
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
    </>
  );
}
