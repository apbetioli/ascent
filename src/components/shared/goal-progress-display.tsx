"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  calculateProgressPercentage,
  formatDeadlineStatus,
} from "@/lib/utils/progress";
import { Trophy, Sparkles, Calendar } from "lucide-react";

export interface GoalProgressData {
  name: string;
  current_amount: number;
  target_amount: number;
  is_reverse: boolean;
  deadline: number | null;
  color: string;
}

interface GoalProgressDisplayProps {
  goal: GoalProgressData;
  showHeader?: boolean;
  headerClassName?: string;
  cardClassName?: string;
  showRemaining?: boolean;
  variant?: "default" | "compact";
  footer?: React.ReactNode;
  customHeader?: React.ReactNode;
  badgePosition?: "header" | "content";
}

export function GoalProgressDisplay({
  goal,
  showHeader = true,
  headerClassName,
  cardClassName,
  showRemaining = true,
  variant = "default",
  footer,
  customHeader,
  badgePosition = "content",
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

  const isSurpassed = goal.is_reverse
    ? percentage <= 0
    : percentage > 100;

  const isComplete = goal.is_reverse
    ? percentage <= 0
    : percentage >= 100;

  const deadlineStatus = formatDeadlineStatus(goal.deadline);
  const isOverdue =
    goal.deadline && goal.deadline < currentTime && !isComplete;

  const remaining = goal.is_reverse
    ? goal.current_amount
    : Math.max(0, goal.target_amount - goal.current_amount);

  const formatAmount = (amount: number) => {
    // Check if it's a monetary value (has decimals or is large)
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

  const titleSize = variant === "compact" ? "text-base" : "text-lg";
  const contentSpacing = variant === "compact" ? "space-y-2" : "space-y-3";

  return (
    <Card
      className={`${badgePosition === "header" ? "relative" : ""} ${cardClassName || ""}`}
      style={{
        borderTopColor: goal.color,
        borderTopWidth: "3px",
      }}
    >
      {showHeader && (
        <CardHeader className={`pb-2 ${headerClassName || ""}`}>
          {customHeader || (
            <>
              <CardTitle className={titleSize}>{goal.name}</CardTitle>
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
            </>
          )}
          {badgePosition === "header" && (
            <>
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
            </>
          )}
        </CardHeader>
      )}

      <CardContent className={contentSpacing}>
        {/* Completion/Surpassed Badge */}
        {badgePosition === "content" && (
          <>
            {isSurpassed && (
              <div className="flex justify-end">
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
              <div className="flex justify-end">
                <Badge variant="default" className="bg-green-500 gap-1">
                  <Sparkles className="h-3 w-3" />
                  Complete!
                </Badge>
              </div>
            )}
          </>
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
