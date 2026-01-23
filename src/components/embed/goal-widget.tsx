"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  calculateProgressPercentage,
  formatDeadlineStatus,
} from "@/lib/utils/progress";
import { Trophy, Sparkles, Calendar, Target } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface EmbedGoalWidgetProps {
  goal: Tables<"goals"> & {
    boards: {
      is_public: boolean;
      public_slug: string | null;
    };
  };
}

export function EmbedGoalWidget({ goal: initialGoal }: EmbedGoalWidgetProps) {
  const [goal, setGoal] = useState(initialGoal);
  const supabase = createClient();

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`embed-goal-${goal.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "goals",
          filter: `id=eq.${goal.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Tables<"goals">>) => {
          if (payload.new && "id" in payload.new) {
            setGoal((prev) => ({
              ...prev,
              ...payload.new,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [goal.id, supabase]);

  const percentage = calculateProgressPercentage(
    goal.current_amount,
    goal.target_amount,
    goal.is_reverse
  );

  const isSurpassed = goal.is_reverse ? percentage <= 0 : percentage > 100;
  const isComplete = goal.is_reverse ? percentage <= 0 : percentage >= 100;
  const deadlineStatus = formatDeadlineStatus(goal.deadline);
  const isOverdue = goal.deadline && goal.deadline < Date.now() && !isComplete;

  const remaining = goal.is_reverse
    ? goal.current_amount
    : Math.max(0, goal.target_amount - goal.current_amount);

  const formatAmount = (amount: number) => {
    if (amount >= 100 || amount % 1 !== 0) {
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
    <Card
      className="w-full max-w-sm mx-auto overflow-hidden"
      style={{
        borderTopColor: goal.color,
        borderTopWidth: "3px",
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base leading-tight">{goal.name}</CardTitle>
          </div>
          {isSurpassed && (
            <Badge
              variant="default"
              className="bg-yellow-500 text-yellow-950 gap-1 shrink-0"
            >
              <Trophy className="h-3 w-3" />
              Surpassed!
            </Badge>
          )}
          {isComplete && !isSurpassed && (
            <Badge variant="default" className="bg-green-500 gap-1 shrink-0">
              <Sparkles className="h-3 w-3" />
              Complete!
            </Badge>
          )}
        </div>
        {deadlineStatus && (
          <p
            className={`text-xs flex items-center gap-1 ${
              isOverdue ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            <Calendar className="h-3 w-3" />
            {deadlineStatus}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {Math.min(Math.round(percentage), 100)}%
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
              {formatAmount(goal.current_amount)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Target: </span>
            <span className="font-medium">
              {formatAmount(goal.target_amount)}
            </span>
          </div>
        </div>

        {!isComplete && (
          <p className="text-xs text-muted-foreground text-center">
            {goal.is_reverse
              ? `${formatAmount(remaining)} spent`
              : `${formatAmount(remaining)} remaining`}
          </p>
        )}

        <p className="text-xs text-center text-muted-foreground pt-1 border-t">
          Powered by{" "}
          <a
            href={process.env.NEXT_PUBLIC_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GoalTrack
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
