import { getLiveVisitorsCount } from "@/lib/redis/visitors";

export default function Visitors() {
  return (
    <p className="text-sm text-muted-foreground">
      {getLiveVisitorsCount()} live visitors
    </p>
  );
}
