"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConvexGoal } from "@/lib/convex-types";
import { cn } from "@/lib/utils";
import {
  calculateProgressPercentage,
  formatDeadlineStatus,
} from "@/lib/utils/progress";
import { AlertCircle, Calendar, CheckCircle2, Repeat } from "lucide-react";
import { useEffect, useState } from "react";

/** Supports Convex shape (camelCase) and legacy snake_case for embed/public views */
type GoalLike =
  | ConvexGoal
  | {
      name: string;
      current_amount: number;
      target_amount: number;
      deadline?: number | null;
      format: "number" | "currency";
      color: string;
      recurrence: string;
    };

function normalizeGoal(goal: GoalLike) {
  const currentAmount =
    "currentAmount" in goal ? goal.currentAmount : goal.current_amount;
  const targetAmount =
    "targetAmount" in goal ? goal.targetAmount : goal.target_amount;
  const deadline = "deadline" in goal ? goal.deadline : goal.deadline;
  return { ...goal, currentAmount, targetAmount, deadline };
}

interface GoalProgressDisplayProps {
  goal: GoalLike;
  cardClassName?: string;
  contextMenu?: React.ReactNode;
  footer?: React.ReactNode;
  contextMenuHoverOnly?: boolean;
  onCardClick?: () => void;
}

export function GoalProgressDisplay({
  goal: goalProp,
  cardClassName,
  contextMenu,
  footer,
  contextMenuHoverOnly,
  onCardClick,
}: GoalProgressDisplayProps) {
  const goal = normalizeGoal(goalProp);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const percentage = calculateProgressPercentage(
    goal.currentAmount,
    goal.targetAmount
  );

  const isSurpassed = percentage > 100;
  const isComplete = percentage >= 100;
  const deadlineStatus = formatDeadlineStatus(goal.deadline ?? null);
  const isOverdue =
    goal.deadline != null && goal.deadline < currentTime && !isComplete;

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
      <CardHeader className="gap-0.5">
        <div className="flex flex-col gap-0.5 min-h-12">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base flex-1 min-w-0 text-start leading-tight">
              {goal.name}
            </CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              {contextMenuEl}
              {isSurpassed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle
                      className="h-5 w-5 cursor-help"
                      style={{ color: goal.color }}
                      aria-hidden
                      tabIndex={0}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Goal surpassed!</TooltipContent>
                </Tooltip>
              )}
              {isComplete && !isSurpassed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CheckCircle2
                      className="h-5 w-5 cursor-help"
                      style={{ color: goal.color }}
                      aria-hidden
                      tabIndex={0}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Goal complete!</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <CardDescription className="flex flex-wrap gap-2 text-xs min-h-[20px] leading-tight -mt-0.5">
            {goal.recurrence && String(goal.recurrence) !== "none" && (
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
        </div>
      </CardHeader>

      <CardContent className={"space-y-2"}>
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg">
                {formatAmount(goal.currentAmount)}
              </span>
              <span className="text-muted-foreground">
                / {formatAmount(goal.targetAmount)}
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
