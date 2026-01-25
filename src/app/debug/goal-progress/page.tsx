"use client";

import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import type { Tables } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

// Helper to create mock goal data
function createMockGoal(
  overrides: Partial<Tables<"goals">>
): Tables<"goals"> {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  return {
    id: "mock-goal-id",
    embed_id: "mock-embed-id",
    board_id: "mock-board-id",
    user_id: "mock-user-id",
    name: "Sample Goal",
    target_amount: 1000,
    current_amount: 0,
    deadline: null,
    recurrence: "none",
    format: "currency",
    color: "#3B82F6",
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export default function GoalProgressDebugPage() {
  const now = Date.now();
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
          <h1 className="text-4xl font-bold mb-2">Goal Progress Display - Debug Page</h1>
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
                  current_amount: 0,
                  target_amount: 1000,
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
                  current_amount: 250,
                  target_amount: 1000,
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
                  current_amount: 500,
                  target_amount: 1000,
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
                  current_amount: 750,
                  target_amount: 1000,
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
                  current_amount: 1000,
                  target_amount: 1000,
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
                  current_amount: 1200,
                  target_amount: 1000,
                })}
              />
            </div>
          </div>
        </section>

        {/* Deadline States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Deadline States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                No Deadline
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "No Deadline Goal",
                  deadline: null,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Deadline: 5 Days Left
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
                Deadline: 1 Day Left
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
                Deadline: Due Today
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
                Deadline: 1 Day Overdue
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Overdue Goal",
                  deadline: now - 1 * oneDay,
                  current_amount: 500,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Deadline: 5 Days Overdue
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Very Overdue",
                  deadline: now - 5 * oneDay,
                  current_amount: 300,
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
                  current_amount: 1000,
                  target_amount: 1000,
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
                  current_amount: 750,
                  target_amount: 1000,
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
                  current_amount: 750,
                  target_amount: 1000,
                })}
              />
            </div>
          </div>
        </section>

        {/* Variant States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Variant States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Default Variant
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Default Size",
                })}
                variant="default"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Compact Variant
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Compact Size",
                })}
                variant="compact"
              />
            </div>
          </div>
        </section>

        {/* Show Remaining States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Show Remaining States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Show Remaining (default)
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "With Remaining",
                  current_amount: 500,
                  showRemaining: true,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Hide Remaining
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Without Remaining",
                  current_amount: 500,
                  showRemaining: false,
                })}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                Complete Goal (no remaining shown)
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Complete - No Remaining",
                  current_amount: 1000,
                  target_amount: 1000,
                  showRemaining: true,
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
              { name: "Red", color: "#EF4444" },
              { name: "Orange", color: "#F97316" },
              { name: "Yellow", color: "#EAB308" },
              { name: "Green", color: "#22C55E" },
              { name: "Teal", color: "#14B8A6" },
              { name: "Blue", color: "#3B82F6" },
              { name: "Indigo", color: "#6366F1" },
              { name: "Violet", color: "#8B5CF6" },
              { name: "Pink", color: "#EC4899" },
            ].map(({ name, color }) => (
              <div key={color}>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  {name}
                </h3>
                <GoalProgressDisplay
                  goal={createMockGoal({
                    name: `${name} Goal`,
                    color,
                    current_amount: 600,
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
                  current_amount: 750,
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
                  current_amount: 750,
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
                  current_amount: 750,
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
                  current_amount: 1200,
                  target_amount: 1000,
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
                  current_amount: 1000,
                  target_amount: 1000,
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
                  current_amount: 750,
                })}
                variant="compact"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                All Features Combined
              </h3>
              <GoalProgressDisplay
                goal={createMockGoal({
                  name: "Everything Combined",
                  current_amount: 850,
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
