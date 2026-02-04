"use client";

import type { ConvexGoal } from "@/lib/convex-types";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { createGoalSchema, updateGoalSchema } from "@/lib/validations";
import { getNextColor } from "@/lib/utils/colors";
import type { Recurrence } from "@/lib/utils/progress";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ZodError } from "zod";

export interface FormState {
  name: string;
  targetAmount: string;
  initialAmount: string;
  currentValue: string;
  deadline: Date | undefined;
  recurrence: Recurrence;
  amountFormat: "number" | "currency";
  color: string;
}

interface UseGoalFormOptions {
  boardId: Id<"boards">;
  existingGoalsCount: number;
  goal?: ConvexGoal;
}

const FORM_FIELD_TO_ERROR_KEY: Partial<Record<keyof FormState, string>> = {
  name: "name",
  targetAmount: "target_amount",
  initialAmount: "initial_amount",
};

function getFormStateFromGoal(goal: ConvexGoal): FormState {
  return {
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    initialAmount: "",
    currentValue: goal.currentAmount.toString(),
    deadline: goal.deadline ? new Date(goal.deadline) : undefined,
    recurrence: goal.recurrence as Recurrence,
    amountFormat: goal.format ?? "number",
    color: goal.color,
  };
}

function getEmptyFormState(existingGoalsCount: number): FormState {
  return {
    name: "",
    targetAmount: "",
    initialAmount: "",
    currentValue: "",
    deadline: undefined,
    recurrence: "none",
    amountFormat: "number",
    color: getNextColor(existingGoalsCount),
  };
}

function getHasEdits(formState: FormState, goal: ConvexGoal): boolean {
  return (
    formState.name.trim() !== goal.name ||
    formState.targetAmount !== goal.targetAmount.toString() ||
    formState.recurrence !== goal.recurrence ||
    formState.amountFormat !== (goal.format ?? "number") ||
    formState.color !== goal.color ||
    (formState.deadline?.getTime() ?? null) !== (goal.deadline ?? null) ||
    formState.currentValue !== goal.currentAmount.toString()
  );
}

function buildUpdatePayload(formState: FormState) {
  const target = parseFloat(formState.targetAmount);
  const data = {
    name: formState.name.trim(),
    deadline: formState.deadline ? formState.deadline.getTime() : null,
    recurrence: formState.recurrence,
    format: formState.amountFormat,
    color: formState.color,
    ...(target > 0 && !isNaN(target) && { target_amount: target }),
  };
  const result = updateGoalSchema.safeParse(data);
  return result.success ? result.data : null;
}

function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function useGoalForm({
  boardId,
  existingGoalsCount,
  goal,
}: UseGoalFormOptions) {
  const isEditMode = !!goal;
  const router = useRouter();
  const userId = useQuery(api.profiles.getCurrentUserId);
  const createGoal = useMutation(api.goals.createGoal);
  const updateGoal = useMutation(api.goals.updateGoal);
  const createRecord = useMutation(api.records.createRecord);

  const [formState, setFormState] = useState<FormState>(() =>
    goal ? getFormStateFromGoal(goal) : getEmptyFormState(existingGoalsCount)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(!isEditMode);

  const currentValueOnFocusRef = useRef<string>("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const updateFormField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
      const errorKey = FORM_FIELD_TO_ERROR_KEY[field];
      if (errorKey) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[errorKey];
          return next;
        });
      }
    },
    []
  );

  const resetForm = useCallback(() => {
    if (isEditMode && goal) {
      const next = getFormStateFromGoal(goal);
      setFormState(next);
      currentValueOnFocusRef.current = next.currentValue;
    } else {
      setFormState(getEmptyFormState(existingGoalsCount));
    }
    setFieldErrors({});
    setIsEditingName(!isEditMode);
  }, [isEditMode, goal, existingGoalsCount]);

  // Sync form when goal changes (edit mode)
  useEffect(() => {
    if (goal) {
      const next = getFormStateFromGoal(goal);
      setFormState(next);
      currentValueOnFocusRef.current = next.currentValue;
    }
  }, [goal]);

  const handleSave = useCallback(async () => {
    if (!isEditMode || !goal || !userId) return;
    const trimmedName = formState.name.trim();
    if (!trimmedName) return;

    const payload = buildUpdatePayload(formState);
    if (!payload) return;

    setIsLoading(true);
    try {
      await updateGoal({
        goalId: goal._id,
        userId,
        name: payload.name,
        ...(payload.target_amount != null && {
          targetAmount: payload.target_amount,
        }),
        deadline: payload.deadline ?? undefined,
        recurrence: payload.recurrence,
        format: payload.format,
        color: payload.color,
      });

      const newCurrent = parseFloat(formState.currentValue);
      if (
        !isNaN(newCurrent) &&
        newCurrent >= 0 &&
        newCurrent !== goal.currentAmount
      ) {
        await createRecord({
          goalId: goal._id,
          userId,
          amount: newCurrent - goal.currentAmount,
          timestamp: Date.now(),
        });
      }
      router.refresh();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isEditMode, goal, formState, userId, updateGoal, createRecord, router]);

  const hasEdits = isEditMode && goal && getHasEdits(formState, goal);

  const handleSaveName = useCallback(() => {
    const trimmed = formState.name.trim();
    if (!trimmed) return;
    const originalName = isEditMode && goal ? goal.name : "";
    if (trimmed === originalName) {
      setIsEditingName(false);
      return;
    }
    updateFormField("name", trimmed);
    setIsEditingName(false);
  }, [formState.name, isEditMode, goal, updateFormField]);

  const handleCancelNameEdit = useCallback(() => {
    if (isEditMode && goal) {
      updateFormField("name", goal.name);
    }
    setIsEditingName(false);
  }, [isEditMode, goal, updateFormField]);

  const addRecordByAmount = useCallback(
    (amount: number) => {
      if (!goal) return;
      const next = (parseFloat(formState.currentValue) || 0) + amount;
      const nextStr = next.toString();
      updateFormField("currentValue", nextStr);
      currentValueOnFocusRef.current = nextStr;
      // In edit mode, record is created only when user clicks Save
    },
    [goal, formState.currentValue, updateFormField]
  );

  const handleCurrentValueBlur = useCallback(() => {
    if (!goal) return;
    const parsed = parseFloat(formState.currentValue);
    if (isNaN(parsed) || parsed < 0) {
      updateFormField("currentValue", goal.currentAmount.toString());
      return;
    }
    currentValueOnFocusRef.current = formState.currentValue;
    // In edit mode, record is created only when user clicks Save
  }, [goal, formState.currentValue, updateFormField]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent, onSuccess?: () => void) => {
      e.preventDefault();
      if (isEditMode) return;

      const target = parseFloat(formState.targetAmount);
      const initial = formState.initialAmount
        ? parseFloat(formState.initialAmount)
        : undefined;

      const validation = createGoalSchema.safeParse({
        board_id: boardId,
        name: formState.name.trim(),
        target_amount: target,
        initial_amount: initial,
        deadline: formState.deadline ? formState.deadline.getTime() : null,
        recurrence: formState.recurrence,
        format: formState.amountFormat,
        color: formState.color,
      });

      if (!validation.success) {
        setFieldErrors(formatZodErrors(validation.error));
        return;
      }

      setIsLoading(true);
      try {
        if (!userId) return;
        const initialValue = initial ?? 0;
        const newGoalId = await createGoal({
          boardId,
          userId,
          name: formState.name.trim(),
          targetAmount: target,
          deadline: formState.deadline
            ? formState.deadline.getTime()
            : undefined,
          recurrence: formState.recurrence,
          format: formState.amountFormat,
          color: formState.color,
          sortOrder: existingGoalsCount,
        });

        if (initialValue > 0 && newGoalId) {
          try {
            await createRecord({
              goalId: newGoalId,
              userId,
              amount: initialValue,
              description: "Initial value",
              timestamp: Date.now(),
            });
          } catch (recordError) {
            console.error("Failed to create initial record:", recordError);
          }
        }
        router.refresh();
        onSuccess?.();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      isEditMode,
      formState,
      boardId,
      existingGoalsCount,
      userId,
      createGoal,
      createRecord,
      router,
    ]
  );

  return {
    formState,
    updateFormField,
    fieldErrors,
    isLoading,
    isEditingName,
    setIsEditingName,
    isEditMode,
    nameInputRef,
    currentValueOnFocusRef,
    resetForm,
    handleSubmit,
    handleSave,
    hasEdits,
    handleSaveName,
    handleCancelNameEdit,
    addRecordByAmount,
    handleCurrentValueBlur,
  };
}
