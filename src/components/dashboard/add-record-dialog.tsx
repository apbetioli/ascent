"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddRecordDialogProps {
  goalId: string;
  goalName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRecordDialog({
  goalId,
  goalName,
  open,
  onOpenChange,
}: AddRecordDialogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(new Date());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue === 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase.from("records").insert({
        goal_id: goalId,
        user_id: user.id,
        amount: amountValue,
        description: description.trim() || null,
        timestamp: date.getTime(),
      });

      if (error) {
        toast.error("Failed to add record");
        console.error(error);
        return;
      }

      toast.success("Record added successfully");
      onOpenChange(false);
      resetForm();
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Progress</DialogTitle>
            <DialogDescription>
              Add a record to &quot;{goalName}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount (can be negative)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                autoFocus
                step="any"
              />
              <p className="text-xs text-muted-foreground">
                Use negative values to subtract progress
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g., Monthly savings deposit"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={2}
              />
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
            <Button type="submit" disabled={isLoading || !amount}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
