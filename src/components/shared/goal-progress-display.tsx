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
import { Calendar, Repeat, Sparkles, TrendingDown, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface GoalProgressDisplayProps {
  goal: Tables<"goals">;
  cardClassName?: string;
  showRemaining?: boolean;
  variant?: "default" | "compact";
  footer?: React.ReactNode;
  contextMenu?: React.ReactNode;
}

export function GoalProgressDisplay({
  goal,
  cardClassName,
  showRemaining = true,
  variant = "default",
  footer,
  contextMenu,
}: GoalProgressDisplayProps) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    // Update current time periodically to check for overdue deadlines
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const percentage = calculateProgressPercentage(
    goal.current_amount,
    goal.target_amount,
    goal.is_reverse
  );

  const isSurpassed = goal.is_reverse ? percentage <= 0 : percentage > 100;
  const isComplete = goal.is_reverse ? percentage <= 0 : percentage >= 100;
  const deadlineStatus = formatDeadlineStatus(goal.deadline);
  const isOverdue = goal.deadline && goal.deadline < currentTime && !isComplete;

  const remaining = goal.is_reverse
    ? goal.current_amount
    : Math.max(0, goal.target_amount - goal.current_amount);

  const formatAmount = (amount: number) => {
    // Check if it's a monetary value (has decimals)
    if (amount % 1 !== 0) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }
    return amount.toLocaleString();
  };

  const titleSize = variant === "compact" ? "text-base" : "text-lg";
  const contentSpacing = variant === "compact" ? "space-y-2" : "space-y-3";

  return (
    <Card
      className={`relative ${cardClassName || ""}`}
      style={{
        borderTopColor: goal.color,
        borderTopWidth: "3px",
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between -mb-2">
          <CardTitle className={titleSize}>{goal.name}</CardTitle>
          {contextMenu}
        </div>
        <CardDescription className="flex flex-wrap gap-2 text-xs">
          {goal.recurrence && goal.recurrence !== "none" && (
            <span className="flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              {goal.recurrence}
            </span>
          )}
          {goal.is_reverse && (
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Reverse
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

      <CardContent className={contentSpacing}>
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

        {/* Progress Bar */}
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

        {/* Current and Target */}
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

        {/* Remaining */}
        {showRemaining && !isComplete && (
          <div className="text-sm text-muted-foreground">
            {goal.is_reverse
              ? `${formatAmount(remaining)} spent`
              : `${formatAmount(remaining)} remaining`}
          </div>
        )}

        {/* Custom Footer */}
        {footer}
      </CardContent>
    </Card>
  );
}
