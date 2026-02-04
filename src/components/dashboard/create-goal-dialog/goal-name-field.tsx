"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { RefObject } from "react";
import type { FormState } from "./use-goal-form";

interface GoalNameFieldProps {
  formState: FormState;
  fieldErrors: Record<string, string>;
  isEditingName: boolean;
  isLoading: boolean;
  nameInputRef: RefObject<HTMLInputElement | null>;
  onUpdateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  onSetEditingName: (editing: boolean) => void;
  onSaveName: () => void;
  onCancelNameEdit: () => void;
  /** When set, blur only closes the field (keeps value). Escape still calls onCancelNameEdit. */
  onNameBlur?: () => void;
}

export function GoalNameField({
  formState,
  fieldErrors,
  isEditingName,
  isLoading,
  nameInputRef,
  onUpdateField,
  onSetEditingName,
  onSaveName,
  onCancelNameEdit,
  onNameBlur,
}: GoalNameFieldProps) {
  const nameError = fieldErrors.name;
  const handleBlur = onNameBlur ?? onCancelNameEdit;

  return (
    <div className="min-h-[2.5rem] flex flex-col gap-1 flex-1 min-w-0">
      <div className="flex items-center gap-1 min-w-0">
        {isEditingName ? (
          <>
            <Input
              ref={nameInputRef}
              value={formState.name}
              onChange={(e) => onUpdateField("name", e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveName();
                if (e.key === "Escape") onCancelNameEdit();
              }}
              disabled={isLoading}
              className={cn(
                "text-lg font-semibold h-9 flex-1 min-w-0",
                nameError && "border-destructive aria-invalid"
              )}
              placeholder="Enter a title for your goal"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "name-error" : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onSaveName}
              disabled={isLoading}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onCancelNameEdit}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onSetEditingName(true)}
            disabled={isLoading}
            className={cn(
              "text-left text-xl font-semibold rounded px-1 -mx-1 hover:bg-muted/50 transition-colors cursor-text",
              !formState.name.trim() && "text-muted-foreground"
            )}
          >
            {formState.name.trim() || "Enter a title for your goal"}
          </button>
        )}
      </div>
      <div className="min-h-5 text-sm">
        {nameError && (
          <p id="name-error" className="text-destructive" role="alert">
            {nameError}
          </p>
        )}
      </div>
    </div>
  );
}
