"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/lib/supabase/types";
import {
  calculateProgressPercentage,
  formatDeadlineStatus,
} from "@/lib/utils/progress";
import { Calendar, Repeat, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface GoalProgressDisplayProps {
  goal: Tables<"goals">;
  cardClassName?: string;
  contextMenu?: React.ReactNode;
  footer?: React.ReactNode;
}

export function GoalProgressDisplay({
  goal,
  cardClassName,
  contextMenu,
  footer,
}: GoalProgressDisplayProps) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    // Update current time periodically to check for overdue due dates
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const percentage = calculateProgressPercentage(
    goal.current_amount,
    goal.target_amount
  );

  const isSurpassed = percentage > 100;
  const isComplete = percentage >= 100;
  const deadlineStatus = formatDeadlineStatus(goal.deadline);
  const isOverdue = goal.deadline && goal.deadline < currentTime && !isComplete;

  const formatAmount = (amount: number) => {
    if (goal.format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
    return amount.toLocaleString();
  };

  return (
    <Card
      className={`relative ${cardClassName || ""}`}
      style={{
        borderTopColor: goal.color,
        borderTopWidth: "3px",
      }}
    >
      <CardHeader>
        <div className="flex items-center gap-2 -mb-2">
          <CardTitle className={"text-base"}>{goal.name}</CardTitle>
          <div className="flex-1" />
          {isSurpassed && (
            <Badge
              variant="default"
              className="bg-yellow-500 text-yellow-950 gap-1"
            >
              <Trophy className="h-3 w-3" />
              Surpassed!
            </Badge>
          )}
          {isComplete && !isSurpassed && (
            <Badge variant="default" className="bg-green-500 gap-1">
              <Sparkles className="h-3 w-3" />
              Complete!
            </Badge>
          )}
          {contextMenu}
        </div>
        <CardDescription className="flex flex-wrap gap-2 text-xs">
          {goal.recurrence && goal.recurrence !== "none" && (
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

      <CardContent className={"space-y-2"}>
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg">
                {formatAmount(goal.current_amount)}
              </span>
              <span className="text-muted-foreground">
                / {formatAmount(goal.target_amount)}
              </span>
            </div>
            <span className="font-medium">{Math.round(percentage)}%</span>
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

        {footer}
      </CardContent>
    </Card>
  );
}
