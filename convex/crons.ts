import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean stale live-visitor rows every minute so the table doesn't grow forever
crons.interval(
  "clean stale visitors",
  { minutes: 1 },
  internal.visitors.cleanStaleVisitors,
  {}
);

export default crons;
