import { getLiveVisitorsCount } from "@/lib/redis/visitors";
import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";

const VISITOR_TARGET = 20;

export default async function Visitors() {
  const visitorCount = (await getLiveVisitorsCount()) ?? 0;

  return (
    <GoalProgressDisplay
      showLiveIndicator
      goal={{
        name: "Online visitors (including you)",
        currentAmount: visitorCount,
        targetAmount: VISITOR_TARGET,
        current_amount: visitorCount,
        target_amount: VISITOR_TARGET,
        format: "number",
        deadline: undefined,
        color: "#3b82f6",
        recurrence: "none",
      }}
    />
  );
}
