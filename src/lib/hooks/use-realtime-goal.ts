"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/**
 * Hook to subscribe to real-time updates for a single goal
 */
export function useRealtimeGoal(initialGoal: Tables<"goals">) {
  const [goal, setGoal] = useState(initialGoal);
  const supabase = createClient();

  useEffect(() => {
    // Update local state when initial goal changes
    setGoal(initialGoal);
  }, [initialGoal]);

  useEffect(() => {
    const channel = supabase
      .channel(`goal-${goal.id}`)
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
            setGoal(payload.new as Tables<"goals">);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [goal.id, supabase]);

  return goal;
}

/**
 * Hook to subscribe to real-time updates for all goals on a board
 */
export function useRealtimeBoardGoals(
  boardId: string,
  initialGoals: Tables<"goals">[]
) {
  const [goals, setGoals] = useState(initialGoals);
  const supabase = createClient();

  useEffect(() => {
    setGoals(initialGoals);
  }, [initialGoals]);

  useEffect(() => {
    const channel = supabase
      .channel(`board-${boardId}-goals`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "goals",
          filter: `board_id=eq.${boardId}`,
        },
        (payload: RealtimePostgresChangesPayload<Tables<"goals">>) => {
          if (payload.new && "id" in payload.new) {
            setGoals((prev) => [...prev, payload.new as Tables<"goals">]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "goals",
          filter: `board_id=eq.${boardId}`,
        },
        (payload: RealtimePostgresChangesPayload<Tables<"goals">>) => {
          if (payload.new && "id" in payload.new) {
            setGoals((prev) =>
              prev.map((g) =>
                g.id === (payload.new as Tables<"goals">).id
                  ? (payload.new as Tables<"goals">)
                  : g
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "goals",
        },
        (payload: RealtimePostgresChangesPayload<Tables<"goals">>) => {
          // DELETE events only have `old` with the primary key (id)
          // Filter client-side by checking if the deleted id exists in our goals
          if (payload.old && "id" in payload.old) {
            const deletedId = (payload.old as { id: string }).id;
            setGoals((prev) => prev.filter((g) => g.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, supabase]);

  return goals;
}
