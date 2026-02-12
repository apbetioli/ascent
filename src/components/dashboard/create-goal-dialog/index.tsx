"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ConvexGoal } from "@/lib/convex-types";
import type { Id } from "convex/_generated/dataModel";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { GoalIncrementRow } from "./goal-increment-row";
import { GoalNameField } from "./goal-name-field";
import { GoalSettingsSection } from "./goal-settings-section";
import { useGoalForm } from "./use-goal-form";

interface CreateGoalDialogProps {
  boardId: Id<"boards">;
  existingGoalsCount: number;
  goal?: ConvexGoal;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, do not render the default "New Goal" trigger (use your own button) */
  hideDefaultTrigger?: boolean;
}

export function CreateGoalDialog({
  boardId,
  existingGoalsCount,
  goal,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideDefaultTrigger = false,
}: CreateGoalDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpenState = controlledOnOpenChange ?? setInternalOpen;

  const form = useGoalForm({
    boardId,
    existingGoalsCount,
    goal,
  });

  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (!next) form.resetForm();
  };

  useEffect(() => {
    if (open) {
      form.nameInputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (form.isEditingName) {
      form.nameInputRef.current?.focus();
    }
  }, [form.isEditingName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.isEditMode) return;
    form.handleSubmit(e, () => setOpen(false));
  };

  const handleSaveEdit = async () => {
    await form.handleSave();
    setOpen(false);
  };

  const showDefaultTrigger =
    !form.isEditMode && !hideDefaultTrigger && controlledOpen === undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showDefaultTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[560px]" showCloseButton={false}>
        <form onSubmit={handleSubmit} className="min-w-0">
          {form.isEditMode ? (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">
                  {form.formState.name.trim() || "Edit Goal"}
                </DialogTitle>
              </DialogHeader>
              <div className="pt-1 min-w-0">
                <GoalNameField
                  formState={form.formState}
                  fieldErrors={form.fieldErrors}
                  isEditingName={form.isEditingName}
                  isLoading={form.isLoading}
                  nameInputRef={form.nameInputRef}
                  onUpdateField={form.updateFormField}
                  onSetEditingName={form.setIsEditingName}
                  onSaveName={form.handleSaveName}
                  onCancelNameEdit={form.handleCancelNameEdit}
                  onNameBlur={() => form.setIsEditingName(false)}
                />
              </div>

              {goal && (
                <div className="mt-2">
                  <GoalIncrementRow
                    formState={form.formState}
                    isLoading={form.isLoading}
                    onUpdateField={form.updateFormField}
                    onFocus={() => {
                      form.currentValueOnFocusRef.current =
                        form.formState.currentValue;
                    }}
                    onBlur={form.handleCurrentValueBlur}
                    onAddAmount={form.addRecordByAmount}
                  />
                </div>
              )}

              <div className="grid gap-4 py-4 border-t mt-4">
                <h4 className="font-medium text-sm">Settings</h4>
                <GoalSettingsSection
                  formState={form.formState}
                  fieldErrors={form.fieldErrors}
                  isEditMode={form.isEditMode}
                  isLoading={form.isLoading}
                  onUpdateField={form.updateFormField}
                />
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>
                  {form.formState.name.trim() || "Create New Goal"}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center mb-2 min-w-0">
                <GoalNameField
                  formState={form.formState}
                  fieldErrors={form.fieldErrors}
                  isEditingName={form.isEditingName}
                  isLoading={form.isLoading}
                  nameInputRef={form.nameInputRef}
                  onUpdateField={form.updateFormField}
                  onSetEditingName={form.setIsEditingName}
                  onSaveName={form.handleSaveName}
                  onCancelNameEdit={form.handleCancelNameEdit}
                />
              </div>
              <div className="grid gap-4 pt-4">
                <GoalSettingsSection
                  formState={form.formState}
                  fieldErrors={form.fieldErrors}
                  isEditMode={form.isEditMode}
                  isLoading={form.isLoading}
                  onUpdateField={form.updateFormField}
                />
              </div>
            </>
          )}

          <DialogFooter className="gap-2 pt-4">
            {form.isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={
                    form.isLoading ||
                    !form.formState.name.trim() ||
                    !form.hasEdits
                  }
                  className="w-full sm:w-auto"
                >
                  {form.isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.isLoading || !form.formState.name.trim()}
                  className="w-full sm:w-auto"
                >
                  {form.isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Goal
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
