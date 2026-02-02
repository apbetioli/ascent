"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BoardOptionsMenu } from "@/components/dashboard/board-options-menu";
import { Input } from "@/components/ui/input";
import type { ConvexBoard } from "@/lib/convex-types";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Check, Globe, Lock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface BoardHeaderProps {
  board: ConvexBoard;
  children?: React.ReactNode;
}

export function BoardHeader({ board, children }: BoardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(board.name);
  const router = useRouter();
  const userId = useQuery(api.profiles.getCurrentUserId);
  const updateBoard = useMutation(api.boards.updateBoard);

  const handleSaveName = async () => {
    if (!name.trim() || !userId) return;
    try {
      await updateBoard({
        boardId: board._id,
        userId,
        name: name.trim(),
      });
      toast.success("Board name updated");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update board name");
      console.error(error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 flex-1">
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
            <h1
              role="button"
              tabIndex={0}
              onClick={() => setIsEditing(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsEditing(true);
                }
              }}
              className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity rounded px-1 -ml-1 border border-transparent hover:border-border/50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {board.name}
            </h1>
            <Badge
              variant={board.isPublic ? "default" : "secondary"}
              className="hidden md:inline-flex"
            >
              {board.isPublic ? (
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

        {!isEditing && children}

        {!isEditing && (
          <BoardOptionsMenu board={board} triggerVariant="outline" />
        )}
      </div>
    </>
  );
}
