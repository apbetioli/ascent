"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Loader2, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { GOAL_COLORS } from "@/lib/utils/colors";
import type { Tables } from "@/lib/supabase/types";
import type { Recurrence } from "@/lib/utils/progress";

interface EditGoalDialogProps {
  goal: Tables<"goals">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGoalDialog({
  goal,
  open,
  onOpenChange,
}: EditGoalDialogProps) {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.target_amount.toString());
  const [deadline, setDeadline] = useState<Date | undefined>(
    goal.deadline ? new Date(goal.deadline) : undefined
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(
    goal.recurrence as Recurrence
  );
  const [isReverse, setIsReverse] = useState(goal.is_reverse);
  const [color, setColor] = useState(goal.color);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Reset form when goal changes
  useEffect(() => {
    setName(goal.name);
    setTargetAmount(goal.target_amount.toString());
    setDeadline(goal.deadline ? new Date(goal.deadline) : undefined);
    setRecurrence(goal.recurrence as Recurrence);
    setIsReverse(goal.is_reverse);
    setColor(goal.color);
  }, [goal]);

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

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("goals")
        .update({
          name: name.trim(),
          target_amount: target,
          deadline: deadline ? deadline.getTime() : null,
          recurrence,
          is_reverse: isReverse,
          color,
        })
        .eq("id", goal.id);

      if (error) {
        toast.error("Failed to update goal");
        console.error(error);
        return;
      }

      toast.success("Goal updated successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>Update your goal settings.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Goal Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Save for vacation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

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
                      initialFocus
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Recurrence</Label>
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
              <div className="grid gap-2">
                <Label>Goal Type</Label>
                <Select
                  value={isReverse ? "reverse" : "normal"}
                  onValueChange={(value) => setIsReverse(value === "reverse")}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal (0% → 100%)</SelectItem>
                    <SelectItem value="reverse">Reverse (100% → 0%)</SelectItem>
                  </SelectContent>
                </Select>
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
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
