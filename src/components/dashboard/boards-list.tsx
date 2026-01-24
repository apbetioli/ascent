"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Globe, Lock } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";

interface BoardsListProps {
  boards: Tables<"boards">[];
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
        <Link key={board.id} href={`/boards/${board.id}`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{board.name}</CardTitle>
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
              <CardDescription>
                Created{" "}
                {formatDistanceToNow(new Date(board.created_at), {
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
