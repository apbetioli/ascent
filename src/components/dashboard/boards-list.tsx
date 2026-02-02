"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ConvexBoard } from "@/lib/convex-types";
import { formatDistanceToNow } from "date-fns";
import { Globe, LayoutDashboard, Lock } from "lucide-react";
import Link from "next/link";

interface BoardsListProps {
  boards: ConvexBoard[];
}

export function BoardsList({ boards }: BoardsListProps) {
  if (boards.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
        <CardTitle className="mb-2">No boards yet</CardTitle>
        <CardDescription>
          Create your first board to start tracking goals
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <Link key={board._id} href={`/boards/${board._id}`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{board.name}</CardTitle>
                <Badge variant={board.isPublic ? "default" : "secondary"}>
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
              <CardDescription>
                Created{" "}
                {formatDistanceToNow(new Date(board._creationTime), {
                  addSuffix: true,
                })}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
