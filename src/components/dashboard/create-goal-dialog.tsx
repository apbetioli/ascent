"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
}

export function CreateGoalDialog({
  boardId,
  existingGoalsCount,
  goal,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateGoalDialogProps) {
  const isEditMode = !!goal;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

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
      setFormState(getFormStateFromGoal(goal));
    }
  }, [goal]);

  const resetForm = () => {
    if (isEditMode && goal) {
      setFormState(getFormStateFromGoal(goal));
    } else {
      setFormState(getEmptyFormState());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form using Zod schema
    const target = parseFloat(formState.targetAmount);
    const currentValue = formState.currentValue
      ? parseFloat(formState.currentValue)
      : undefined;
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

    if (isEditMode && currentValue !== undefined) {
      validationData.current_value = currentValue;
    }

    const validation = updateGoalSchema.safeParse(validationData);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    if (!isEditMode) {
      if (initial !== undefined && (isNaN(initial) || initial < 0)) {
        toast.error("Please enter a valid initial amount");
        return;
      }
    }

    setIsLoading(true);

    try {
      const user = await getUser();

      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      if (isEditMode && goal) {
        // Calculate difference for current value if changed
        if (currentValue !== undefined && !isNaN(currentValue)) {
          const difference = currentValue - goal.current_amount;
          if (difference !== 0) {
            // Silently create a record with the difference
            try {
              await createRecord({
                goal_id: goal.id,
                user_id: user.id,
                amount: difference,
                description: null,
                timestamp: Date.now(),
              });
            } catch (recordError) {
              console.error(
                "Failed to create record for current value:",
                recordError
              );
              // Continue with goal update even if record creation fails
            }
          }
        }

        // Update existing goal
        const updateData = {
          name: formState.name.trim(),
          target_amount: target,
          deadline: formState.deadline ? formState.deadline.getTime() : null,
          recurrence: formState.recurrence,
          format: formState.amountFormat,
          color: formState.color,
        };
        await updateGoal(goal.id, updateData);

        toast.success("Goal updated successfully");
        setOpen(false);
        router.refresh();
      } else {
        // Create new goal
        const initialValue = initial ?? 0;
        const createData = {
          board_id: boardId,
          user_id: user.id,
          name: formState.name.trim(),
          target_amount: target,
          deadline: formState.deadline ? formState.deadline.getTime() : null,
          recurrence: formState.recurrence,
          format: formState.amountFormat,
          color: formState.color,
          sort_order: existingGoalsCount,
        };
        const newGoal = await createGoal(createData);

        // If there's an initial amount, create an initial record
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
            // Goal was created, just warn about the record
            toast.warning(
              "Goal created but failed to set initial amount. You can add it manually."
            );
          }
        }

        toast.success("Goal created successfully");
        setOpen(false);
        resetForm();
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[500px]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your goal settings."
              : "Set up a new goal to track your progress."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={isEditMode ? "edit-name" : "name"}>Goal Name</Label>
            <Input
              id={isEditMode ? "edit-name" : "name"}
              placeholder="e.g., Save for vacation"
              value={formState.name}
              onChange={(e) => updateFormField("name", e.target.value)}
              disabled={isLoading}
              autoFocus={!isEditMode}
            />
          </div>

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
                onChange={(e) =>
                  updateFormField("targetAmount", e.target.value)
                }
                disabled={isLoading}
                min="0"
                step="any"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-current" : "initial"}>
                {isEditMode ? "Current Value" : "Initial Value (optional)"}
              </Label>
              <Input
                id={isEditMode ? "edit-current" : "initial"}
                type="number"
                placeholder="0"
                value={
                  isEditMode ? formState.currentValue : formState.initialAmount
                }
                onChange={(e) =>
                  updateFormField(
                    isEditMode ? "currentValue" : "initialAmount",
                    e.target.value
                  )
                }
                disabled={isLoading}
                min="0"
                step="any"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Format</Label>
              <Select
                value={formState.amountFormat}
                onValueChange={(value) =>
                  updateFormField(
                    "amountFormat",
                    value as "number" | "currency"
                  )
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
            <div className="grid gap-2">
              <Label>Recurring</Label>
              <Select
                value={formState.recurrence}
                onValueChange={(value) =>
                  updateFormField("recurrence", value as Recurrence)
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
