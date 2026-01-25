"use client";

import { useState } from "react";
import { useRealtimeBoardGoals } from "@/lib/hooks";
import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Target, Code, Copy } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";
import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";

interface PublicBoardViewProps {
  board: Tables<"boards">;
  goals: Tables<"goals">[];
}

export function PublicBoardView({
  board,
  goals: initialGoals,
}: PublicBoardViewProps) {
  const goals = useRealtimeBoardGoals(board.id, initialGoals);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [selectedGoalForEmbed, setSelectedGoalForEmbed] =
    useState<Tables<"goals"> | null>(null);

  const sortedGoals = [...goals].sort((a, b) => a.sort_order - b.sort_order);

  const handleShowEmbedCode = (goal: Tables<"goals">) => {
    setSelectedGoalForEmbed(goal);
    setEmbedDialogOpen(true);
  };

  const handleCopyEmbedCode = () => {
    if (!selectedGoalForEmbed) return;
    const embedCode = `<iframe src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${selectedGoalForEmbed.embed_id}" width="400" height="200" frameborder="0" style="border-radius: 8px;"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
        <p className="text-muted-foreground">
          {sortedGoals.length} goal{sortedGoals.length !== 1 ? "s" : ""}
        </p>
      </div>

      {sortedGoals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No goals yet</CardTitle>
          <CardDescription>This board has no goals.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedGoals.map((goal) => (
            <GoalProgressDisplay
              key={goal.id}
              goal={goal}
              cardClassName="relative overflow-hidden transition-all hover:shadow-md"
              footer={
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleShowEmbedCode(goal)}
                >
                  <Code className="mr-2 h-3 w-3" />
                  Embed This Goal
                </Button>
              }
            />
          ))}
        </div>
      )}

      <Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed Goal Widget</DialogTitle>
            <DialogDescription>
              Copy the code below to embed this goal on your website.
            </DialogDescription>
          </DialogHeader>
          {selectedGoalForEmbed && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <code className="text-xs break-all">
                  {`<iframe src="${process.env.NEXT_PUBLIC_APP_URL}/embed/${selectedGoalForEmbed.embed_id}" width="400" height="200" frameborder="0" style="border-radius: 8px;"></iframe>`}
                </code>
              </div>
              <Button onClick={handleCopyEmbedCode} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Embed Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
