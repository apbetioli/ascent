"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormState } from "./use-goal-form";

interface GoalIncrementRowProps {
  formState: FormState;
  isLoading: boolean;
  onUpdateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  onFocus: () => void;
  onBlur: () => void;
  onAddAmount: (amount: number) => void;
}

export function GoalIncrementRow({
  formState,
  isLoading,
  onUpdateField,
  onFocus,
  onBlur,
  onAddAmount,
}: GoalIncrementRowProps) {
  const disabled = isLoading;

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="edit-current-value">Current value</Label>
        <Input
          id="edit-current-value"
          type="number"
          className="w-full"
          value={formState.currentValue}
          onChange={(e) => onUpdateField("currentValue", e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          disabled={disabled}
          min="0"
          step="any"
        />
      </div>
      <div className="flex flex-wrap justify-between">
        {([1, 5, 10, 100] as const).map((n) => (
          <Button
            key={n}
            type="button"
            variant="secondary"
            size="lg"
            disabled={disabled}
            onClick={() => onAddAmount(n)}
          >
            <span className="text-md font-semibold">+{n}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
