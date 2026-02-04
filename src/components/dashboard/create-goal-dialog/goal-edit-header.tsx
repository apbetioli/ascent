"use client";

import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Code, MoreHorizontal, Trash2, X } from "lucide-react";

interface GoalEditHeaderProps {
  onEmbedClick?: () => void;
  onDeleteClick?: () => void;
}

export function GoalEditHeader({ onEmbedClick, onDeleteClick }: GoalEditHeaderProps) {
  const showMenu = onEmbedClick || onDeleteClick;

  if (!showMenu) return null;

  return (
    <div className="flex items-center justify-end gap-1 absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEmbedClick && (
            <DropdownMenuItem onClick={onEmbedClick}>
              <Code className="mr-2 h-4 w-4" />
              Embed Goal
            </DropdownMenuItem>
          )}
          {onDeleteClick && (
            <>
              {onEmbedClick && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDeleteClick}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Goal
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogClose asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogClose>
    </div>
  );
}
