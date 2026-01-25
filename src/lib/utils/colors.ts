// Default color palette for goals
export const GOAL_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#14B8A6", // teal
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#F43F5E", // rose
  "#64748B", // slate
] as const;

export type GoalColor = (typeof GOAL_COLORS)[number];

/**
 * Get a random color from the palette
 */
export function getRandomColor(): GoalColor {
  return GOAL_COLORS[Math.floor(Math.random() * GOAL_COLORS.length)];
}

/**
 * Get the next color in sequence based on existing goals count
 */
export function getNextColor(existingGoalsCount: number): GoalColor {
  return GOAL_COLORS[existingGoalsCount % GOAL_COLORS.length];
}

/**
 * Validate if a color is from our palette
 */
export function isValidGoalColor(color: string): color is GoalColor {
  return GOAL_COLORS.includes(color as GoalColor);
}
