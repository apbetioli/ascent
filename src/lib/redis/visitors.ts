import { redis } from "./redis";

const setKey = "visitors:live";

export async function addVisitor(ipAddress: string) {
  if (!redis) {
    return;
  }
  try {
    const added = await redis.sadd(setKey, ipAddress);
    await redis.expire(setKey, 60);
    return added;
  } catch {
    console.warn("Redis offline. No new visitors added.");
    return 0;
  }
}

export async function getLiveVisitorsCount() {
  if (!redis) {
    return;
  }
  try {
    const count = await redis.scard(setKey);
    return count ?? 0;
  } catch {
    console.warn("Redis offline. Returning 0 visitors.");
    return 0;
  }
}
