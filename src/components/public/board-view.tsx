"use client";

import { useState } from "react";
import { useRealtimeBoardGoals } from "@/lib/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  calculateProgressPercentage,
  formatDeadlineStatus,
} from "@/lib/utils/progress";
import {
  Target,
  Trophy,
  Sparkles,
  Calendar,
  Repeat,
  Code,
  Copy,
} from "lucide-react";
import type { Tables } from "@/lib/supabase/types";

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

  const formatAmount = (amount: number, format: "number" | "currency" = "number") => {
    if (format === "currency") {
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
          {sortedGoals.map((goal) => {
            const percentage = calculateProgressPercentage(
              goal.current_amount,
              goal.target_amount
            );
            const isSurpassed = percentage > 100;
            const isComplete = percentage >= 100;
            const deadlineStatus = formatDeadlineStatus(goal.deadline);
            const isOverdue =
              goal.deadline && goal.deadline < Date.now() && !isComplete;
            const remaining = Math.max(0, goal.target_amount - goal.current_amount);

            return (
              <Card
                key={goal.id}
                className="relative overflow-hidden"
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
                  <CardTitle className="text-lg pr-20">{goal.name}</CardTitle>
                  <CardDescription className="flex flex-wrap gap-2 text-xs">
                    {goal.recurrence !== "none" && (
                      <span className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        {goal.recurrence}
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
                        {formatAmount(goal.current_amount, goal.format || "number")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target: </span>
                      <span className="font-medium">
                        {formatAmount(goal.target_amount, goal.format || "number")}
                      </span>
                    </div>
                  </div>

                  {!isComplete && (
                    <div className="text-sm text-muted-foreground">
                      {formatAmount(remaining, goal.format || "number")} remaining
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleShowEmbedCode(goal)}
                  >
                    <Code className="mr-2 h-3 w-3" />
                    Embed This Goal
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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
