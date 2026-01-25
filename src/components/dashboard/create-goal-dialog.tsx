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
import { cn } from "@/lib/utils";
import { GOAL_COLORS, getNextColor } from "@/lib/utils/colors";
import type { Recurrence } from "@/lib/utils/progress";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

  const [name, setName] = useState(goal?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(
    goal?.target_amount.toString() ?? ""
  );
  const [initialAmount, setInitialAmount] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(
    goal?.deadline ? new Date(goal.deadline) : undefined
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(
    (goal?.recurrence as Recurrence) ?? "none"
  );
  const [amountFormat, setAmountFormat] = useState<"number" | "currency">(
    goal?.format ?? "number"
  );
  const [color, setColor] = useState(
    goal?.color ?? getNextColor(existingGoalsCount)
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    getUser,
    createGoal,
    updateGoal,
    createRecord,
  } = useSupabase();

  // Reset form when goal changes (edit mode)
  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.target_amount.toString());
      setDeadline(goal.deadline ? new Date(goal.deadline) : undefined);
      setRecurrence(goal.recurrence as Recurrence);
      setAmountFormat(goal.format ?? "number");
      setColor(goal.color);
    }
  }, [goal]);

  const resetForm = () => {
    if (isEditMode && goal) {
      setName(goal.name);
      setTargetAmount(goal.target_amount.toString());
      setDeadline(goal.deadline ? new Date(goal.deadline) : undefined);
      setRecurrence(goal.recurrence as Recurrence);
      setAmountFormat(goal.format ?? "number");
      setColor(goal.color);
    } else {
      setName("");
      setTargetAmount("");
      setInitialAmount("");
      setDeadline(undefined);
      setRecurrence("none");
      setAmountFormat("number");
      setColor(getNextColor(existingGoalsCount));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a goal name");
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      toast.error("Please enter a valid target amount");
      return;
    }

    if (!isEditMode) {
      const initial = initialAmount ? parseFloat(initialAmount) : 0;
      if (isNaN(initial) || initial < 0) {
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
        // Update existing goal
        await updateGoal(goal.id, {
          name: name.trim(),
          target_amount: target,
          deadline: deadline ? deadline.getTime() : null,
          recurrence,
          format: amountFormat,
          color,
        });

        toast.success("Goal updated successfully");
        setOpen(false);
        router.refresh();
      } else {
        // Create new goal
        const initial = initialAmount ? parseFloat(initialAmount) : 0;
        const newGoal = await createGoal({
          board_id: boardId,
          user_id: user.id,
          name: name.trim(),
          target_amount: target,
          deadline: deadline ? deadline.getTime() : null,
          recurrence,
          format: amountFormat,
          color,
          sort_order: existingGoalsCount,
        });

        // If there's an initial amount, create an initial record
        if (initial > 0 && newGoal) {
          try {
            await createRecord({
              goal_id: newGoal.id,
              user_id: user.id,
              amount: initial,
              description: "Initial amount",
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus={!isEditMode}
            />
          </div>

          {!isEditMode ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="target">Target Amount</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="10000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  disabled={isLoading}
                  min="0"
                  step="any"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="initial">Initial Amount (optional)</Label>
                <Input
                  id="initial"
                  type="number"
                  placeholder="0"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  disabled={isLoading}
                  min="0"
                  step="any"
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="edit-target">Target Amount</Label>
              <Input
                id="edit-target"
                type="number"
                placeholder="10000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                disabled={isLoading}
                min="0"
                step="any"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Format</Label>
              <Select
                value={amountFormat}
                onValueChange={(value) =>
                  setAmountFormat(value as "number" | "currency")
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
                value={recurrence}
                onValueChange={(value) => setRecurrence(value as Recurrence)}
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
            <Label>Deadline (optional)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Pick a deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    autoFocus
                    disabled={
                      isEditMode ? undefined : (date) => date < new Date()
                    }
                  />
                </PopoverContent>
              </Popover>
              {deadline && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setDeadline(undefined)}
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
                    color === c
                      ? "ring-2 ring-offset-2 ring-primary scale-110"
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
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
          <Button type="submit" disabled={isLoading || !name.trim()}>
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
