import { redis } from "./redis";

const setKey = "visitors:live";

export async function addVisitor(ipAddress: string) {
  if (!redis) {
    return;
  }
  const added = await redis.sadd(setKey, ipAddress);
  await redis.expire(setKey, 60);
  return added;
}

export async function getLiveVisitorsCount() {
  if (!redis) {
    return;
  }
  const count = await redis.scard(setKey);
  return count ?? 0;
}
