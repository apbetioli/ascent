"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import { Target } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface EmbedGoalWidgetProps {
  goal: Tables<"goals"> & {
    boards: {
      is_public: boolean;
      public_slug: string | null;
    };
  };
}

export function EmbedGoalWidget({ goal: initialGoal }: EmbedGoalWidgetProps) {
  const [goal, setGoal] = useState(initialGoal);
  const supabase = createClient();

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`embed-goal-${goal.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "goals",
          filter: `id=eq.${goal.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Tables<"goals">>) => {
          if (payload.new && "id" in payload.new) {
            setGoal((prev) => ({
              ...prev,
              ...payload.new,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [goal.id, supabase]);

  const customHeader = (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-muted-foreground" />
        <span className="text-base leading-tight font-semibold">{goal.name}</span>
      </div>
    </div>
  );

  return (
    <GoalProgressDisplay
      goal={{
        name: goal.name,
        current_amount: goal.current_amount,
        target_amount: goal.target_amount,
        is_reverse: goal.is_reverse,
        deadline: goal.deadline,
        color: goal.color,
      }}
      customHeader={customHeader}
      variant="compact"
      cardClassName="w-full max-w-sm mx-auto overflow-hidden"
      footer={
        <p className="text-xs text-center text-muted-foreground pt-1 border-t">
          Powered by{" "}
          <a
            href={process.env.NEXT_PUBLIC_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GoalTrack
          </a>
        </p>
      }
    />
  );
}
