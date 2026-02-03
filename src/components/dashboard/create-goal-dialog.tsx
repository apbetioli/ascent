"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { ConvexGoal } from "@/lib/convex-types";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { createGoalSchema, updateGoalSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { GOAL_COLORS, getNextColor } from "@/lib/utils/colors";
import type { Recurrence } from "@/lib/utils/progress";
import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  Code,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface FormState {
  name: string;
  targetAmount: string;
  initialAmount: string;
  currentValue: string;
  deadline: Date | undefined;
  recurrence: Recurrence;
  amountFormat: "number" | "currency";
  color: string;
}

interface CreateGoalDialogProps {
  boardId: Id<"boards">;
  existingGoalsCount: number;
  goal?: ConvexGoal;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, do not render the default "New Goal" trigger (use your own button) */
  hideDefaultTrigger?: boolean;
  onEmbedClick?: () => void;
  onDeleteClick?: () => void;
}

export function CreateGoalDialog({
  boardId,
  existingGoalsCount,
  goal,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideDefaultTrigger = false,
  onEmbedClick,
  onDeleteClick,
}: CreateGoalDialogProps) {
  const isEditMode = !!goal;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpenState = controlledOnOpenChange ?? setInternalOpen;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (!next) resetForm();
  };

  const [formState, setFormState] = useState<FormState>(() => ({
    name: goal?.name ?? "",
    targetAmount: goal?.targetAmount.toString() ?? "",
    initialAmount: "",
    currentValue: goal?.currentAmount.toString() ?? "",
    deadline: goal?.deadline ? new Date(goal.deadline) : undefined,
    recurrence: (goal?.recurrence as Recurrence) ?? "none",
    amountFormat: goal?.format ?? "number",
    color: goal?.color ?? getNextColor(existingGoalsCount),
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(!isEditMode);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const currentValueOnFocusRef = useRef<string>("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isInitialMountRef = useRef(true);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousFormStateRef = useRef<FormState | null>(null);

  const updateFormField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const getFormStateFromGoal = (goal: ConvexGoal): FormState => ({
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    initialAmount: "",
    currentValue: goal.currentAmount.toString(),
    deadline: goal.deadline ? new Date(goal.deadline) : undefined,
    recurrence: goal.recurrence as Recurrence,
    amountFormat: goal.format ?? "number",
    color: goal.color,
  });

  const getEmptyFormState = (): FormState => ({
    name: "",
    targetAmount: "",
    initialAmount: "",
    currentValue: "",
    deadline: undefined,
    recurrence: "none",
    amountFormat: "number",
    color: getNextColor(existingGoalsCount),
  });

  const router = useRouter();
  const userId = useQuery(api.profiles.getCurrentUserId);
  const createGoal = useMutation(api.goals.createGoal);
  const updateGoal = useMutation(api.goals.updateGoal);
  const createRecord = useMutation(api.records.createRecord);

  // Auto-save function for edit mode
  const autoSave = useCallback(async () => {
    if (!isEditMode || !goal || isInitialMountRef.current) return;

    const trimmedName = formState.name.trim();
    if (!trimmedName) return; // Don't save if name is empty

    const target = parseFloat(formState.targetAmount);
    if (isNaN(target) || target < 0) return;

    const validationData: {
      name?: string;
      target_amount?: number;
      deadline?: number | null;
      recurrence?: Recurrence;
      format?: "number" | "currency";
      color?: string;
    } = {
      name: trimmedName,
      deadline: formState.deadline ? formState.deadline.getTime() : null,
      recurrence: formState.recurrence,
      format: formState.amountFormat,
      color: formState.color,
    };

    // Only include target_amount if it's a valid number
    if (!isNaN(target) && target > 0) {
      validationData.target_amount = target;
    }

    const validation = updateGoalSchema.safeParse(validationData);

    if (!validation.success) return;

    try {
      const updatePayload: {
        name?: string;
        targetAmount?: number;
        deadline?: number;
        recurrence?: Recurrence;
        format?: "number" | "currency";
        color?: string;
      } = {
        name: trimmedName,
        deadline: formState.deadline ? formState.deadline.getTime() : undefined,
        recurrence: formState.recurrence,
        format: formState.amountFormat,
        color: formState.color,
      };

      if (!isNaN(target) && target > 0) {
        updatePayload.targetAmount = target;
      }

      if (!userId) return;
      await updateGoal({ goalId: goal._id, userId, ...updatePayload });
      previousFormStateRef.current = { ...formState };
      router.refresh();
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }, [isEditMode, goal, formState, updateGoal, router, userId]);

  // Reset form when goal changes (edit mode)
  useEffect(() => {
    if (goal) {
      const next = getFormStateFromGoal(goal);
      setFormState(next);
      currentValueOnFocusRef.current = next.currentValue;
      previousFormStateRef.current = next;
      isInitialMountRef.current = true;
      // Reset initial mount flag after a short delay
      setTimeout(() => {
        isInitialMountRef.current = false;
      }, 100);
    }
  }, [goal]);

  // Auto-save on form state changes (edit mode only, excluding currentValue)
  useEffect(() => {
    if (!isEditMode || !goal || isInitialMountRef.current) return;

    // Skip if currentValue changed (it has its own handler)
    const prev = previousFormStateRef.current;
    if (
      prev &&
      formState.currentValue === prev.currentValue &&
      formState.name === prev.name &&
      formState.targetAmount === prev.targetAmount &&
      formState.recurrence === prev.recurrence &&
      formState.amountFormat === prev.amountFormat &&
      formState.color === prev.color &&
      formState.deadline?.getTime() === prev.deadline?.getTime()
    ) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounce auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
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

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (open) {
      nameInputRef.current?.focus();
    }
  }, [open]);

  const resetForm = () => {
    if (isEditMode && goal) {
      const next = getFormStateFromGoal(goal);
      setFormState(next);
      currentValueOnFocusRef.current = next.currentValue;
    } else {
      setFormState(getEmptyFormState());
    }
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
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
    if (!goal) return;
    setIsLoading(true);
    try {
      const target = parseFloat(formState.targetAmount);
      const validationData: {
        name?: string;
        target_amount?: number;
        deadline?: number | null;
        recurrence?: Recurrence;
        format?: "number" | "currency";
        color?: string;
      } = {
        name: trimmed,
        deadline: formState.deadline ? formState.deadline.getTime() : null,
        recurrence: formState.recurrence,
        format: formState.amountFormat,
        color: formState.color,
      };

      // Only include target_amount if it's a valid number
      if (!isNaN(target) && target > 0) {
        validationData.target_amount = target;
      }

      const validation = updateGoalSchema.safeParse(validationData);
      if (!validation.success) return;
      if (!userId) return;
      await updateGoal({ goalId: goal._id, userId, name: trimmed });
      updateFormField("name", trimmed);
      // Update previous state to prevent auto-save from triggering
      previousFormStateRef.current = { ...formState, name: trimmed };
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsEditingName(false);
    }
  };

  const handleCancelNameEdit = () => {
    if (isEditMode && goal) {
      updateFormField("name", goal.name);
    }
    setIsEditingName(false);
  };

  const addRecordByAmount = async (amount: number) => {
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
  };

  const handleCurrentValueBlur = async () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // In edit mode, just close the dialog (auto-save handles saving)
    if (isEditMode) {
      setOpen(false);
      return;
    }

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

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementRow = isEditMode && goal && (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="edit-current-value">Current value</Label>
        <Input
          id="edit-current-value"
          type="number"
          className="w-full"
          value={formState.currentValue}
          onChange={(e) => updateFormField("currentValue", e.target.value)}
          onFocus={() => {
            currentValueOnFocusRef.current = formState.currentValue;
          }}
          onBlur={handleCurrentValueBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          disabled={isLoading || isAddingRecord}
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
            disabled={isLoading || isAddingRecord}
            onClick={() => addRecordByAmount(n)}
          >
            <span className="text-md font-semibold">+{n}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  const inlineNameEdit = (
    <div className="min-h-[2.5rem] flex items-center">
      {isEditingName ? (
        <div className="flex items-center gap-1 flex-1">
          <Input
            ref={nameInputRef}
            value={formState.name}
            onChange={(e) => updateFormField("name", e.target.value)}
            onBlur={handleCancelNameEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveName();
              if (e.key === "Escape") handleCancelNameEdit();
            }}
            disabled={isLoading}
            className="text-lg font-semibold h-9"
            placeholder="Enter a title for your goal"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSaveName}
            disabled={isLoading}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleCancelNameEdit}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditingName(true)}
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
  );

  const settingsSection = (
    <div className="grid gap-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={isEditMode ? "edit-target" : "target"}>
            Target Value
          </Label>
          <Input
            id={isEditMode ? "edit-target" : "target"}
            type="number"
            placeholder="10000"
            value={formState.targetAmount}
            onChange={(e) => updateFormField("targetAmount", e.target.value)}
            disabled={isLoading}
            min="0"
            step="any"
          />
        </div>
        {!isEditMode ? (
          <div className="grid gap-2">
            <Label htmlFor="initial">Initial Value (optional)</Label>
            <Input
              id="initial"
              type="number"
              placeholder="0"
              value={formState.initialAmount}
              onChange={(e) => updateFormField("initialAmount", e.target.value)}
              disabled={isLoading}
              min="0"
              step="any"
            />
          </div>
        ) : (
          <div className="grid gap-2">
            <Label>Format</Label>
            <Select
              value={formState.amountFormat}
              onValueChange={(v) =>
                updateFormField("amountFormat", v as "number" | "currency")
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
            onValueChange={(v) =>
              updateFormField("recurrence", v as Recurrence)
            }
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
                  onSelect={(date) => updateFormField("deadline", date)}
                  autoFocus
                  disabled={
                    isEditMode ? undefined : (date) => date < new Date()
                  }
                />
              </PopoverContent>
            </Popover>
            {formState.deadline && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => updateFormField("deadline", undefined)}
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
              onClick={() => updateFormField("color", c)}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const editHeader = isEditMode && (onEmbedClick || onDeleteClick) && (
    <div className="flex items-center justify-end gap-1 absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEmbedClick && (
            <DropdownMenuItem onClick={onEmbedClick}>
              <Code className="mr-2 h-4 w-4" />
              Embed Goal
            </DropdownMenuItem>
          )}
          {onDeleteClick && (
            <>
              {onEmbedClick && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDeleteClick}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Goal
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogClose asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogClose>
    </div>
  );

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
      <form onSubmit={handleSubmit}>
        {editHeader}

        {isEditMode ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">
                {formState.name.trim() || "Edit Goal"}
              </DialogTitle>
            </DialogHeader>
            <div className="pr-24 pt-1">{inlineNameEdit}</div>

            {incrementRow && <div className="mt-2">{incrementRow}</div>}

            <div className="grid gap-4 py-4 border-t mt-4">
              <h4 className="font-medium text-sm">Settings</h4>
              {settingsSection}
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>
                {formState.name.trim() || "Create New Goal"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center pr-12 mb-2">{inlineNameEdit}</div>
            <div className="grid gap-4 pt-4">{settingsSection}</div>
          </>
        )}

        <DialogFooter>
          {!isEditMode && (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formState.name.trim()}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Goal
              </Button>
            </>
          )}
        </DialogFooter>
      </form>
    </DialogContent>
  );

  const showDefaultTrigger =
    !isEditMode && !hideDefaultTrigger && controlledOpen === undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showDefaultTrigger && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </DialogTrigger>
      )}
      {dialogContent}
    </Dialog>
  );
}
