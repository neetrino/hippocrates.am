import { Pool } from "pg";

/** No HTTP use for this long means the site is idle and Neon may suspend. */
export const DATABASE_IDLE_MS = 5 * 60 * 1000;

/** Drop unused sockets quickly so Neon’s suspend timer is not held open. */
const SOCKET_IDLE_MS = 10_000;

export const DATABASE_POOL = Symbol("DATABASE_POOL");

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export function createDatabasePool(connectionString: string): Pool {
  return new Pool({
    connectionString,
    max: positiveInt(process.env.DATABASE_CONNECTION_LIMIT, 10),
    connectionTimeoutMillis: positiveInt(process.env.DATABASE_POOL_TIMEOUT, 20) * 1000,
    idleTimeoutMillis: SOCKET_IDLE_MS,
    allowExitOnIdle: true,
  });
}
