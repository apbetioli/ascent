"use client";

import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

interface EmbedGoalWidgetProps {
  goal: Tables<"goals">;
}

export function EmbedGoalWidget({ goal: initialGoal }: EmbedGoalWidgetProps) {
  const [goal, setGoal] = useState(initialGoal);
  const supabase = useMemo(() => createClient(), []);

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

  return (
    <GoalProgressDisplay
      goal={goal}
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
