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
 * Based on WCAG 2.1 specification
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
 * Calculate the contrast ratio between two colors
 * Returns a value between 1 (no contrast) and 21 (maximum contrast)
 * Based on WCAG 2.1 specification
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get the appropriate text color (white or dark) for a given background color
 * Ensures WCAG AA contrast ratio of at least 4.5:1 for normal text
 * Returns the text color that provides the best contrast
 */
export function getContrastTextColor(backgroundColor: string): string {
  const white = "#ffffff";
  // Use a very dark gray instead of pure black for better visual appearance
  // while still maintaining excellent contrast
  const dark = "#0f172a"; // slate-900 equivalent
  
  // Calculate contrast ratios
  const whiteContrast = getContrastRatio(backgroundColor, white);
  const darkContrast = getContrastRatio(backgroundColor, dark);
  
  // Use the color with the higher contrast ratio
  // For badges, we want at least 4.5:1 for WCAG AA compliance
  if (whiteContrast >= darkContrast && whiteContrast >= 4.5) {
    return white;
  } else if (darkContrast >= 4.5) {
    return dark;
  } else {
    // If neither meets 4.5:1, use the one with better contrast
    // This handles edge cases where colors might be mid-tone
    return whiteContrast > darkContrast ? white : dark;
  }
}
