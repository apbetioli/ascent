"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { useSupabase } from "@/lib/hooks/use-supabase";
import type { Tables } from "@/lib/supabase/types";
import { updateGoalSchema } from "@/lib/validations";
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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  boardId: string;
  existingGoalsCount: number;
  goal?: Tables<"goals">;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEmbedClick?: () => void;
  onDeleteClick?: () => void;
}

export function CreateGoalDialog({
  boardId,
  existingGoalsCount,
  goal,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
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
    targetAmount: goal?.target_amount.toString() ?? "",
    initialAmount: "",
    currentValue: goal?.current_amount.toString() ?? "",
    deadline: goal?.deadline ? new Date(goal.deadline) : undefined,
    recurrence: (goal?.recurrence as Recurrence) ?? "none",
    amountFormat: goal?.format ?? "number",
    color: goal?.color ?? getNextColor(existingGoalsCount),
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const currentValueOnFocusRef = useRef<string>("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const updateFormField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const getFormStateFromGoal = (goal: Tables<"goals">): FormState => ({
    name: goal.name,
    targetAmount: goal.target_amount.toString(),
    initialAmount: "",
    currentValue: goal.current_amount.toString(),
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
  const { getUser, createGoal, updateGoal, createRecord } = useSupabase();

  // Reset form when goal changes (edit mode)
  useEffect(() => {
    if (goal) {
      const next = getFormStateFromGoal(goal);
      setFormState(next);
      currentValueOnFocusRef.current = next.currentValue;
    }
  }, [goal]);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);

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
    if (!trimmed) {
      toast.error("Goal name cannot be empty");
      return;
    }
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
      const validation = updateGoalSchema.safeParse({
        name: trimmed,
        target_amount: parseFloat(formState.targetAmount),
        deadline: formState.deadline ? formState.deadline.getTime() : null,
        recurrence: formState.recurrence,
        format: formState.amountFormat,
        color: formState.color,
      });
      if (!validation.success) {
        toast.error(validation.error.issues[0].message);
        return;
      }
      await updateGoal(goal.id, { name: trimmed });
      updateFormField("name", trimmed);
      toast.success("Goal name updated");
      router.refresh();
    } catch (e) {
      toast.error("Failed to update goal name");
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
    if (!goal) return;
    const user = await getUser();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    setIsAddingRecord(true);
    try {
      await createRecord({
        goal_id: goal.id,
        user_id: user.id,
        amount,
        description: null,
        timestamp: Date.now(),
      });
      const next = (parseFloat(formState.currentValue) || 0) + amount;
      const nextStr = next.toString();
      updateFormField("currentValue", nextStr);
      currentValueOnFocusRef.current = nextStr;
      toast.success("Progress added");
      router.refresh();
    } catch (e) {
      toast.error("Failed to add progress");
      console.error(e);
    } finally {
      setIsAddingRecord(false);
    }
  };

  const handleCurrentValueBlur = async () => {
    if (!goal) return;
    const parsed = parseFloat(formState.currentValue);
    if (isNaN(parsed) || parsed < 0) {
      updateFormField("currentValue", goal.current_amount.toString());
      return;
    }
    const prev = parseFloat(currentValueOnFocusRef.current);
    if (isNaN(prev)) return;
    const delta = parsed - prev;
    if (delta === 0) return;
    const user = await getUser();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    setIsAddingRecord(true);
    try {
      await createRecord({
        goal_id: goal.id,
        user_id: user.id,
        amount: delta,
        description: null,
        timestamp: Date.now(),
      });
      currentValueOnFocusRef.current = formState.currentValue;
      toast.success("Progress updated");
      router.refresh();
    } catch (e) {
      toast.error("Failed to update progress");
      updateFormField("currentValue", currentValueOnFocusRef.current);
      console.error(e);
    } finally {
      setIsAddingRecord(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const target = parseFloat(formState.targetAmount);
    const initial = formState.initialAmount
      ? parseFloat(formState.initialAmount)
      : undefined;

    const validationData: {
      name?: string;
      target_amount?: number;
      current_value?: number;
      deadline?: number | null;
      recurrence?: Recurrence;
      format?: "number" | "currency";
      color?: string;
    } = {
      name: formState.name.trim(),
      target_amount: target,
      deadline: formState.deadline ? formState.deadline.getTime() : null,
      recurrence: formState.recurrence,
      format: formState.amountFormat,
      color: formState.color,
    };

    const validation = updateGoalSchema.safeParse(validationData);

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    if (
      !isEditMode &&
      initial !== undefined &&
      (isNaN(initial) || initial < 0)
    ) {
      toast.error("Please enter a valid initial amount");
      return;
    }

    setIsLoading(true);

    try {
      const user = await getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      if (isEditMode && goal) {
        await updateGoal(goal.id, {
          name: formState.name.trim(),
          target_amount: target,
          deadline: formState.deadline ? formState.deadline.getTime() : null,
          recurrence: formState.recurrence,
          format: formState.amountFormat,
          color: formState.color,
        });
        toast.success("Goal updated successfully");
        setOpen(false);
        router.refresh();
      } else {
        const initialValue = initial ?? 0;
        const newGoal = await createGoal({
          board_id: boardId,
          user_id: user.id,
          name: formState.name.trim(),
          target_amount: target,
          deadline: formState.deadline ? formState.deadline.getTime() : null,
          recurrence: formState.recurrence,
          format: formState.amountFormat,
          color: formState.color,
          sort_order: existingGoalsCount,
        });

        if (initialValue > 0 && newGoal) {
          try {
            await createRecord({
              goal_id: newGoal.id,
              user_id: user.id,
              amount: initialValue,
              description: "Initial value",
              timestamp: Date.now(),
            });
          } catch (recordError) {
            console.error("Failed to create initial record:", recordError);
            toast.warning(
              "Goal created but failed to set initial amount. You can add it manually."
            );
          }
        }

        toast.success("Goal created successfully");
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementRow = isEditMode && goal && (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid gap-2">
        <Label htmlFor="edit-current-value">Current value</Label>
        <Input
          id="edit-current-value"
          type="number"
          className="w-24"
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
      {([1, 5, 10, 100] as const).map((n) => (
        <Button
          key={n}
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading || isAddingRecord}
          onClick={() => addRecordByAmount(n)}
        >
          +{n}
        </Button>
      ))}
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
            "text-left text-lg font-semibold rounded px-1 -mx-1 hover:bg-muted/50 transition-colors cursor-text",
            !formState.name.trim() && "text-muted-foreground"
          )}
        >
          {formState.name.trim() || "Enter a title for your goal"}
        </button>
      )}
    </div>
  );

  const settingsSection = (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
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
              <SelectTrigger>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Recurring</Label>
          <Select
            value={formState.recurrence}
            onValueChange={(v) =>
              updateFormField("recurrence", v as Recurrence)
            }
            disabled={isLoading}
          >
            <SelectTrigger>
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
                    "flex-1 justify-start text-left font-normal",
                    !formState.deadline && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formState.deadline
                    ? format(formState.deadline, "PPP")
                    : "Pick a due date"}
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
    <DialogContent
      className="sm:max-w-[500px]"
      showCloseButton={!isEditMode || !(onEmbedClick || onDeleteClick)}
    >
      <form onSubmit={handleSubmit}>
        {editHeader}

        {isEditMode ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">
                {formState.name.trim() || "Edit Goal"}
              </DialogTitle>
            </DialogHeader>
            <div className="pr-24 pt-1">
              {inlineNameEdit}
              {incrementRow && <div className="mt-3">{incrementRow}</div>}
            </div>
            <div className="grid gap-4 py-4 border-t mt-4">
              <h4 className="font-medium text-sm">Settings</h4>
              {settingsSection}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">
                {formState.name.trim() || "Create New Goal"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">{inlineNameEdit}</div>
              {settingsSection}
            </div>
          </>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !formState.name.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Save" : "Create Goal"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditMode && (
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
