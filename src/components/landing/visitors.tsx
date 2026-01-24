import { getLiveVisitorsCount } from "@/lib/redis/visitors";
import { GoalProgressDisplay } from "@/components/shared/goal-progress-display";

const VISITOR_TARGET = 20;

export default async function Visitors() {
  const visitorCount = (await getLiveVisitorsCount()) ?? 0;

  return (
    <div className="w-full max-w-sm mx-auto">
      <GoalProgressDisplay
        goal={{
          name: "Live Visitors",
          current_amount: visitorCount,
          target_amount: VISITOR_TARGET,
          is_reverse: false,
          deadline: null,
          color: "#3b82f6", // Blue color
        }}
        variant="compact"
        showRemaining={false}
      />
    </div>
  );
}
