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

/**
 * Calculate the relative luminance of a color
 * Returns a value between 0 (dark) and 1 (light)
 */
function getLuminance(hex: string): number {
  // Remove # if present
  const rgb = hex.replace("#", "");
  
  // Parse RGB values
  const r = parseInt(rgb.substring(0, 2), 16) / 255;
  const g = parseInt(rgb.substring(2, 4), 16) / 255;
  const b = parseInt(rgb.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const [rLinear, gLinear, bLinear] = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Get the appropriate text color (white or dark) for a given background color
 * Returns "white" for dark backgrounds and a dark color for light backgrounds
 */
export function getContrastTextColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);
  // Use white text for backgrounds with luminance < 0.5, dark text otherwise
  return luminance < 0.5 ? "white" : "#1f2937"; // dark gray for light backgrounds
}
