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
import { cn } from "@/lib/utils";
import { getContrastTextColor } from "@/lib/utils/colors";
import {
  calculateProgressPercentage,
  formatDeadlineStatus,
} from "@/lib/utils/progress";
import { AlertCircleIcon, Calendar, Repeat, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface GoalProgressDisplayProps {
  goal: Tables<"goals">;
  cardClassName?: string;
  contextMenu?: React.ReactNode;
  footer?: React.ReactNode;
  contextMenuHoverOnly?: boolean;
  onCardClick?: () => void;
}

export function GoalProgressDisplay({
  goal,
  cardClassName,
  contextMenu,
  footer,
  contextMenuHoverOnly,
  onCardClick,
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

  const cardCls = cn(
    "relative",
    contextMenuHoverOnly && "group",
    onCardClick && "cursor-pointer",
    cardClassName
  );
  const contextMenuEl =
    contextMenu && (contextMenuHoverOnly || onCardClick) ? (
      <div
        className={cn(
          "flex items-center gap-1",
          contextMenuHoverOnly &&
            "opacity-0 transition-opacity group-hover:opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {contextMenu}
      </div>
    ) : (
      contextMenu
    );

  return (
    <Card
      className={cardCls}
      style={{
        borderTopColor: goal.color,
        borderTopWidth: "3px",
      }}
      onClick={onCardClick}
      onKeyDown={
        onCardClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCardClick();
              }
            }
          : undefined
      }
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-2 -mb-2">
          <CardTitle className="text-base flex-1 text-start">
            {goal.name}
          </CardTitle>
          {isSurpassed && (
            <Badge
              variant="default"
              className="gap-1"
              style={{
                backgroundColor: goal.color,
                color: getContrastTextColor(goal.color),
              }}
            >
              <AlertCircleIcon className="h-3 w-3" />
              Surpassed!
            </Badge>
          )}
          {isComplete && !isSurpassed && (
            <Badge
              variant="default"
              className="gap-1"
              style={{
                backgroundColor: goal.color,
                color: getContrastTextColor(goal.color),
              }}
            >
              <Sparkles className="h-3 w-3" />
              Complete!
            </Badge>
          )}
          {contextMenuEl}
        </div>
        <CardDescription className="flex flex-wrap gap-2 text-xs min-h-[20px]">
          {goal.recurrence && goal.recurrence !== "none" && (
            <span className="flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              {goal.recurrence}
            </span>
          )}
          {deadlineStatus && !isComplete && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue && deadlineStatus !== "Due today"
                  ? "text-destructive"
                  : ""
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
            surpassedValue={isSurpassed ? percentage : undefined}
            className="h-3"
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
