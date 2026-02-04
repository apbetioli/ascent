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

function getFormStateFromGoal(goal: ConvexGoal, existingGoalsCount: number): FormState {
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
    goal ? getFormStateFromGoal(goal, existingGoalsCount) : getEmptyFormState(existingGoalsCount)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isEditingName, setIsEditingName] = useState(!isEditMode);

  const currentValueOnFocusRef = useRef<string>("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isInitialMountRef = useRef(true);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousFormStateRef = useRef<FormState | null>(null);

  const updateFormField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    const errorKeys: Partial<Record<keyof FormState, string>> = {
      name: "name",
      targetAmount: "target_amount",
      initialAmount: "initial_amount",
    };
    const errorKey = errorKeys[field];
    if (errorKey) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  }, []);

  const resetForm = useCallback(() => {
    if (isEditMode && goal) {
      const next = getFormStateFromGoal(goal, existingGoalsCount);
      setFormState(next);
      currentValueOnFocusRef.current = next.currentValue;
      previousFormStateRef.current = next;
    } else {
      setFormState(getEmptyFormState(existingGoalsCount));
    }
    setFieldErrors({});
    setIsEditingName(!isEditMode);
  }, [isEditMode, goal, existingGoalsCount]);

  // Sync form when goal changes (edit mode)
  useEffect(() => {
    if (goal) {
      const next = getFormStateFromGoal(goal, existingGoalsCount);
      setFormState(next);
      currentValueOnFocusRef.current = next.currentValue;
      previousFormStateRef.current = next;
      isInitialMountRef.current = true;
      setTimeout(() => {
        isInitialMountRef.current = false;
      }, 100);
    }
  }, [goal, existingGoalsCount]);

  // Auto-save (edit mode only)
  const autoSave = useCallback(async () => {
    if (!isEditMode || !goal || isInitialMountRef.current) return;
    const trimmedName = formState.name.trim();
    if (!trimmedName) return;

    const payload = buildUpdatePayload(formState);
    if (!payload || !userId) return;

    try {
      await updateGoal({
        goalId: goal._id,
        userId,
        name: payload.name,
        ...(payload.target_amount != null && { targetAmount: payload.target_amount }),
        deadline: payload.deadline ?? undefined,
        recurrence: payload.recurrence,
        format: payload.format,
        color: payload.color,
      });
      previousFormStateRef.current = { ...formState };
      router.refresh();
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [isEditMode, goal, formState, updateGoal, router, userId]);

  useEffect(() => {
    if (!isEditMode || !goal || isInitialMountRef.current) return;

    const prev = previousFormStateRef.current;
    const same =
      prev &&
      formState.currentValue === prev.currentValue &&
      formState.name === prev.name &&
      formState.targetAmount === prev.targetAmount &&
      formState.recurrence === prev.recurrence &&
      formState.amountFormat === prev.amountFormat &&
      formState.color === prev.color &&
      formState.deadline?.getTime() === prev.deadline?.getTime();
    if (same) return;

    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(autoSave, 500);
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [
    isEditMode,
    goal,
    formState.name,
    formState.currentValue,
    formState.targetAmount,
    formState.recurrence,
    formState.amountFormat,
    formState.color,
    formState.deadline,
    autoSave,
  ]);

  const handleSaveName = useCallback(async () => {
    const trimmed = formState.name.trim();
    if (!trimmed) return;
    if (trimmed === (isEditMode && goal ? goal.name : "")) {
      setIsEditingName(false);
      return;
    }
    if (!isEditMode) {
      updateFormField("name", trimmed);
      setIsEditingName(false);
      return;
    }
    if (!goal || !userId) return;
    setIsLoading(true);
    try {
      await updateGoal({ goalId: goal._id, userId, name: trimmed });
      updateFormField("name", trimmed);
      previousFormStateRef.current = { ...formState, name: trimmed };
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsEditingName(false);
    }
  }, [formState, isEditMode, goal, userId, updateGoal, updateFormField, router]);

  const handleCancelNameEdit = useCallback(() => {
    if (isEditMode && goal) {
      updateFormField("name", goal.name);
    }
    setIsEditingName(false);
  }, [isEditMode, goal, updateFormField]);

  const addRecordByAmount = useCallback(
    async (amount: number) => {
      if (!goal || !userId) return;
      setIsAddingRecord(true);
      try {
        await createRecord({
          goalId: goal._id,
          userId,
          amount,
          timestamp: Date.now(),
        });
        const next = (parseFloat(formState.currentValue) || 0) + amount;
        const nextStr = next.toString();
        updateFormField("currentValue", nextStr);
        currentValueOnFocusRef.current = nextStr;
        router.refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setIsAddingRecord(false);
      }
    },
    [goal, userId, formState.currentValue, createRecord, updateFormField, router]
  );

  const handleCurrentValueBlur = useCallback(async () => {
    if (!goal) return;
    const parsed = parseFloat(formState.currentValue);
    if (isNaN(parsed) || parsed < 0) {
      updateFormField("currentValue", goal.currentAmount.toString());
      return;
    }
    const prev = parseFloat(currentValueOnFocusRef.current);
    if (isNaN(prev)) return;
    const delta = parsed - prev;
    if (delta === 0) return;
    if (!userId) return;
    setIsAddingRecord(true);
    try {
      await createRecord({
        goalId: goal._id,
        userId,
        amount: delta,
        timestamp: Date.now(),
      });
      currentValueOnFocusRef.current = formState.currentValue;
      router.refresh();
    } catch (e) {
      updateFormField("currentValue", currentValueOnFocusRef.current);
      console.error(e);
    } finally {
      setIsAddingRecord(false);
    }
  }, [goal, formState.currentValue, userId, createRecord, updateFormField, router]);

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
        const errors: Record<string, string> = {};
        for (const issue of validation.error.issues) {
          const key = issue.path.join(".");
          if (!key || errors[key]) continue;
          errors[key] = issue.message;
        }
        setFieldErrors(errors);
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
          deadline: formState.deadline ? formState.deadline.getTime() : undefined,
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
    isAddingRecord,
    isEditingName,
    setIsEditingName,
    isEditMode,
    nameInputRef,
    currentValueOnFocusRef,
    resetForm,
    handleSubmit,
    handleSaveName,
    handleCancelNameEdit,
    addRecordByAmount,
    handleCurrentValueBlur,
  };
}
