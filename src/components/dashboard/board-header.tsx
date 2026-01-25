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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface BoardHeaderProps {
  board: Tables<"boards">;
  children?: React.ReactNode;
}

export function BoardHeader({ board, children }: BoardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(board.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error("Board name cannot be empty");
      return;
    }

    const { error } = await supabase
      .from("boards")
      .update({ name: name.trim() })
      .eq("id", board.id);

    if (error) {
      toast.error("Failed to update board name");
      return;
    }

    toast.success("Board name updated");
    setIsEditing(false);
    router.refresh();
  };

  const handleTogglePublic = async () => {
    const { error } = await supabase
      .from("boards")
      .update({ is_public: !board.is_public })
      .eq("id", board.id);

    if (error) {
      toast.error("Failed to update board visibility");
      return;
    }

    toast.success(
      board.is_public ? "Board is now private" : "Board is now public"
    );
    router.refresh();
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    const { error } = await supabase.from("boards").delete().eq("id", board.id);

    if (error) {
      toast.error("Failed to delete board");
      setIsDeleting(false);
      return;
    }

    toast.success("Board deleted");
    router.push("/boards");
    router.refresh();
  };

  const handleCopyPublicLink = () => {
    if (!board.public_slug) return;
    const url = `${window.location.origin}/public/${board.public_slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied to clipboard");
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-bold h-auto py-1 max-w-md"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") {
                  setName(board.name);
                  setIsEditing(false);
                }
              }}
            />
            <Button size="icon" variant="ghost" onClick={handleSaveName}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setName(board.name);
                setIsEditing(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-2xl font-bold">{board.name}</h1>
            <Badge variant={board.is_public ? "default" : "secondary"}>
              {board.is_public ? (
                <>
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </>
              )}
            </Badge>
          </div>
        )}

        {children}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleTogglePublic}>
              {board.is_public ? (
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
            {board.is_public && board.public_slug && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyPublicLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Public Link
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/public/${board.public_slug}`}
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
      </div>

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
