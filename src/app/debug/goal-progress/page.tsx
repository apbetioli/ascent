"use client";

import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

type MockGoal = {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: number | null;
  recurrence: string;
  format: "number" | "currency";
  color: string;
  current_amount: number;
  target_amount: number;
};

function createMockGoal(overrides: Partial<MockGoal>): MockGoal {
  const base = {
    name: "Sample Goal",
    targetAmount: 1000,
    currentAmount: 0,
    deadline: null,
    recurrence: "none",
    format: "currency" as const,
    color: "#3B82F6",
    ...overrides,
  };
  return {
    ...base,
    current_amount: base.currentAmount,
    target_amount: base.targetAmount,
  };
}

export default function GoalProgressDebugPage() {
  const now = new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  const mockContextMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const mockFooter = (
    <div className="text-xs text-muted-foreground pt-2 border-t">
      Last updated: {new Date().toLocaleString()}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Goal Progress Display - Debug Page
          </h1>
          <p className="text-muted-foreground">
            All possible states of the GoalProgressDisplay component
          </p>
        </div>

        {/* Progress States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Progress States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Not Started (0%)
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "New Goal",
                  currentAmount: 0,
                  targetAmount: 1000,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                In Progress (25%)
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Quarter Complete",
                  currentAmount: 250,
                  targetAmount: 1000,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                In Progress (50%)
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Halfway There",
                  currentAmount: 500,
                  targetAmount: 1000,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                In Progress (75%)
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Almost Done",
                  currentAmount: 750,
                  targetAmount: 1000,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Complete (100%)
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Completed Goal",
                  currentAmount: 1000,
                  targetAmount: 1000,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Surpassed (120%)
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Surpassed Goal",
                  currentAmount: 1200,
                  targetAmount: 1000,
                })}
              />
            </div>
          </div>
        </section>

        {/* Due Date States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Due Date States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                No Due Date
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "No Due Date Goal",
                  deadline: null,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Due Date: 5 Days Left
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "5 Days Remaining",
                  deadline: now + 5 * oneDay,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Due Date: 1 Day Left
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Due Tomorrow",
                  deadline: now + 1 * oneDay,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Due Date: Due Today
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Due Today",
                  deadline: now,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Due Date: 1 Day Overdue
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Overdue Goal",
                  deadline: now - 1 * oneDay,
                  currentAmount: 500,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Due Date: 5 Days Overdue
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Very Overdue",
                  deadline: now - 5 * oneDay,
                  currentAmount: 300,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Overdue but Complete (no red text)
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Overdue but Done",
                  deadline: now - 3 * oneDay,
                  currentAmount: 1000,
                  targetAmount: 1000,
                })}
              />
            </div>
          </div>
        </section>

        {/* Recurrence States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Recurrence States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                No Recurrence
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "One-time Goal",
                  recurrence: "none",
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Daily Recurrence
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Daily Goal",
                  recurrence: "daily",
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Weekly Recurrence
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Weekly Goal",
                  recurrence: "weekly",
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Monthly Recurrence
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Monthly Goal",
                  recurrence: "monthly",
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Yearly Recurrence
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Yearly Goal",
                  recurrence: "yearly",
                })}
              />
            </div>
          </div>
        </section>

        {/* Format States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Format States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Currency Format
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Money Goal",
                  format: "currency",
                  currentAmount: 750,
                  targetAmount: 1000,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Number Format
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Count Goal",
                  format: "number",
                  currentAmount: 750,
                  targetAmount: 1000,
                })}
              />
            </div>
          </div>
        </section>

        {/* Color States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Color States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Red",
                color: "#EF4444",
                currentAmount: 1000,
                targetAmount: 1000,
              }, // Complete
              {
                name: "Orange",
                color: "#F97316",
                currentAmount: 1200,
                targetAmount: 1000,
              }, // Surpassed
              { name: "Yellow", color: "#EAB308", currentAmount: 600 }, // In Progress
              {
                name: "Green",
                color: "#22C55E",
                currentAmount: 1000,
                targetAmount: 1000,
              }, // Complete
              {
                name: "Teal",
                color: "#14B8A6",
                currentAmount: 1300,
                targetAmount: 1000,
              }, // Surpassed
              { name: "Blue", color: "#3B82F6", currentAmount: 600 }, // In Progress
              {
                name: "Indigo",
                color: "#6366F1",
                currentAmount: 1000,
                targetAmount: 1000,
              }, // Complete
              {
                name: "Violet",
                color: "#8B5CF6",
                currentAmount: 1150,
                targetAmount: 1000,
              }, // Surpassed
              { name: "Pink", color: "#EC4899", currentAmount: 600 }, // In Progress
            ].map(({ name, color, currentAmount, targetAmount = 1000 }) => (
              <div key={color}>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  {name}
                </h3>
                <GoalProgressDisplay
                  goal={createMockGoal({
                    name: `${name} Goal`,
                    color,
                    currentAmount,
                    targetAmount,
                  })}
                />
              </div>
            ))}
          </div>
        </section>

        {/* With Context Menu and Footer */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">With Context Menu & Footer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                With Context Menu
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Goal with Menu",
                  currentAmount: 750,
                })}
                contextMenu={mockContextMenu}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                With Footer
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Goal with Footer",
                  currentAmount: 750,
                })}
                footer={mockFooter}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                With Both
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Full Featured",
                  currentAmount: 750,
                })}
                contextMenu={mockContextMenu}
                footer={mockFooter}
              />
            </div>
          </div>
        </section>

        {/* Complex Combinations */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Complex Combinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Surpassed + Overdue + Recurrence
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Complex State 1",
                  currentAmount: 1200,
                  targetAmount: 1000,
                  deadline: now - 2 * oneDay,
                  recurrence: "weekly",
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Complete + Due Today + Daily
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Complex State 2",
                  currentAmount: 1000,
                  targetAmount: 1000,
                  deadline: now,
                  recurrence: "daily",
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Compact + Number Format + Monthly
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Complex State 3",
                  format: "number",
                  recurrence: "monthly",
                  currentAmount: 750,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                All Features Combined
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Everything Combined",
                  currentAmount: 850,
                  deadline: now + 3 * oneDay,
                  recurrence: "yearly",
                  format: "currency",
                  color: "#8B5CF6",
                })}
                contextMenu={mockContextMenu}
                footer={mockFooter}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
