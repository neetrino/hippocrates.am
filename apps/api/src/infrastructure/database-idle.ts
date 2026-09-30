import { DATABASE_IDLE_MS } from "./database-pool";

export function shouldReleaseDatabase(state: {
  used: boolean;
  announced: boolean;
  idleForMs: number;
}): boolean {
  return state.used && !state.announced && state.idleForMs >= DATABASE_IDLE_MS;
}
