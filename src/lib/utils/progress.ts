import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: number | null;
  recurrence: Recurrence;
  is_reverse: boolean;
}

export interface Record {
  id: string;
  amount: number;
  timestamp: number;
}

/**
 * Get the start of the current recurrence window based on recurrence type and user timezone
 */
export function getRecurrenceWindowStart(
  recurrence: Recurrence,
  timezone: string
): number {
  const now = new Date();
  const zonedNow = toZonedTime(now, timezone);

  let windowStart: Date;

  switch (recurrence) {
    case "daily":
      windowStart = startOfDay(zonedNow);
      break;
    case "weekly":
      windowStart = startOfWeek(zonedNow, { weekStartsOn: 1 }); // Monday
      break;
    case "monthly":
      windowStart = startOfMonth(zonedNow);
      break;
    case "yearly":
      windowStart = startOfYear(zonedNow);
      break;
    case "none":
    default:
      // For non-recurring goals, include all records
      return 0;
  }

  return windowStart.getTime();
}

/**
 * Filter records that fall within the recurrence window
 */
export function filterRecordsByRecurrence(
  records: Record[],
  recurrence: Recurrence,
  timezone: string
): Record[] {
  if (recurrence === "none") {
    return records;
  }

  const windowStart = getRecurrenceWindowStart(recurrence, timezone);
  return records.filter((record) => record.timestamp >= windowStart);
}

/**
 * Calculate the progress amount from records
 */
export function calculateProgressAmount(records: Record[]): number {
  return records.reduce((sum, record) => sum + record.amount, 0);
}

/**
 * Calculate the progress percentage for a goal
 * Returns a number that can exceed 100 (surpassed goals)
 */
export function calculateProgressPercentage(
  currentAmount: number,
  targetAmount: number,
  isReverse: boolean
): number {
  if (targetAmount === 0) return isReverse ? 100 : 0;

  const percentage = (currentAmount / targetAmount) * 100;

  if (isReverse) {
    // Reverse goals: 100% at start, decreases as progress is made
    return Math.max(0, 100 - percentage);
  }

  // Normal goals: can exceed 100%
  return percentage;
}

/**
 * Calculate full progress data for a goal
 */
export function calculateGoalProgress(
  goal: Goal,
  records: Record[],
  timezone: string
): {
  currentAmount: number;
  percentage: number;
  remaining: number;
  isSurpassed: boolean;
  isComplete: boolean;
} {
  const relevantRecords = filterRecordsByRecurrence(
    records,
    goal.recurrence,
    timezone
  );

  const currentAmount = calculateProgressAmount(relevantRecords);
  const percentage = calculateProgressPercentage(
    currentAmount,
    goal.target_amount,
    goal.is_reverse
  );

  const remaining = goal.is_reverse
    ? currentAmount // For reverse goals, remaining is how much was "spent"
    : Math.max(0, goal.target_amount - currentAmount);

  const isSurpassed = goal.is_reverse
    ? percentage <= 0
    : percentage > 100;

  const isComplete = goal.is_reverse
    ? percentage <= 0
    : percentage >= 100;

  return {
    currentAmount,
    percentage,
    remaining,
    isSurpassed,
    isComplete,
  };
}

/**
 * Calculate days remaining until deadline
 * Returns negative number if deadline has passed
 */
export function getDaysUntilDeadline(deadline: number | null): number | null {
  if (!deadline) return null;

  const now = Date.now();
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format the deadline status text
 */
export function formatDeadlineStatus(deadline: number | null): string | null {
  const days = getDaysUntilDeadline(deadline);
  if (days === null) return null;

  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === -1) return "1 day overdue";
  if (days > 0) return `${days} days left`;
  return `${Math.abs(days)} days overdue`;
}
