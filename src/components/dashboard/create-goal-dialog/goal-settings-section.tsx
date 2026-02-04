"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GOAL_COLORS } from "@/lib/utils/colors";
import type { Recurrence } from "@/lib/utils/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { FormState } from "./use-goal-form";

interface GoalSettingsSectionProps {
  formState: FormState;
  fieldErrors: Record<string, string>;
  isEditMode: boolean;
  isLoading: boolean;
  onUpdateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
}

export function GoalSettingsSection({
  formState,
  fieldErrors,
  isEditMode,
  isLoading,
  onUpdateField,
}: GoalSettingsSectionProps) {
  return (
    <div className="grid gap-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={isEditMode ? "edit-target" : "target"}>Target Value</Label>
          <Input
            id={isEditMode ? "edit-target" : "target"}
            type="number"
            placeholder="10000"
            value={formState.targetAmount}
            onChange={(e) => onUpdateField("targetAmount", e.target.value)}
            disabled={isLoading}
            min="0"
            step="any"
            aria-invalid={!!fieldErrors.target_amount}
            aria-describedby={
              fieldErrors.target_amount ? "target_amount-error" : undefined
            }
            className={cn(fieldErrors.target_amount && "border-destructive")}
          />
          {fieldErrors.target_amount && (
            <p
              id="target_amount-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {fieldErrors.target_amount}
            </p>
          )}
        </div>
        {!isEditMode ? (
          <div className="grid gap-2">
            <Label htmlFor="initial">Initial Value (optional)</Label>
            <Input
              id="initial"
              type="number"
              placeholder="0"
              value={formState.initialAmount}
              onChange={(e) => onUpdateField("initialAmount", e.target.value)}
              disabled={isLoading}
              min="0"
              step="any"
              aria-invalid={!!fieldErrors.initial_amount}
              aria-describedby={
                fieldErrors.initial_amount ? "initial_amount-error" : undefined
              }
              className={cn(fieldErrors.initial_amount && "border-destructive")}
            />
            {fieldErrors.initial_amount && (
              <p
                id="initial_amount-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {fieldErrors.initial_amount}
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-2">
            <Label>Format</Label>
            <Select
              value={formState.amountFormat}
              onValueChange={(v) =>
                onUpdateField("amountFormat", v as "number" | "currency")
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Recurring</Label>
          <Select
            value={formState.recurrence}
            onValueChange={(v) => onUpdateField("recurrence", v as Recurrence)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select recurrence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Due Date (optional)</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 min-w-0 justify-start text-left font-normal",
                    !formState.deadline && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {formState.deadline
                      ? format(formState.deadline, "PPP")
                      : "Pick a due date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formState.deadline}
                  onSelect={(date) => onUpdateField("deadline", date)}
                  autoFocus
                  disabled={!isEditMode ? (date) => date < new Date() : undefined}
                />
              </PopoverContent>
            </Popover>
            {formState.deadline && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onUpdateField("deadline", undefined)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {GOAL_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "w-8 h-8 rounded-full transition-all",
                formState.color === c
                  ? "ring-2 ring-offset-2 ring-primary scale-110"
                  : "hover:scale-105"
              )}
              style={{ backgroundColor: c }}
              onClick={() => onUpdateField("color", c)}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
