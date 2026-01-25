"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  surpassedValue?: number;
}

function Progress({
  className,
  value,
  surpassedValue,
  style,
  ...props
}: ProgressProps) {
  const { theme, resolvedTheme } = useTheme();
  const progressColor = "var(--progress-background, hsl(var(--primary)))";
  const normalizedValue = Math.min(value || 0, 100);
  const surpassed =
    surpassedValue && surpassedValue > 100
      ? Math.min(surpassedValue - 100, 100)
      : 0;
  
  // Determine if we're in dark mode
  const isDark = resolvedTheme === "dark" || (resolvedTheme === undefined && theme === "dark");
  // Use light lines for light mode, dark lines for dark mode
  const textureColor = isDark 
    ? "rgba(0, 0, 0, 0.5)" 
    : "rgba(255, 255, 255, 0.5)";

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      style={style}
      {...props}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: progressColor,
          opacity: 0.25,
        }}
      />
      {/* Base progress (up to 100%) */}
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="relative z-10 h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - normalizedValue}%)`,
          backgroundColor: progressColor,
        }}
      />
      {/* Surpassed portion with texture - only on the surpassed part (>100%) */}
      {surpassed > 0 && (
        <div
          className="absolute z-40 h-full transition-all rounded-full"
          data-surpassed={surpassed}
          style={{
            right: 0,
            width: `${surpassed}%`,
            minWidth: surpassed > 0 ? "4px" : "0px",
            backgroundColor: progressColor,
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              ${textureColor},
              ${textureColor} 2.5px,
              transparent 2.5px,
              transparent 8px
            )`,
            pointerEvents: "none",
            top: 0,
            bottom: 0,
          }}
        />
      )}
    </ProgressPrimitive.Root>
  );
}

export { Progress };
