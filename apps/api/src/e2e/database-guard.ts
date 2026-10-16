const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export type E2eEnv = {
  E2E_DATABASE?: string;
  DATABASE_URL?: string;
  DIRECT_URL?: string;
  SESSION_SECRET?: string;
  SEED_PASSWORD?: string;
};

/** Refuses the suite unless every database URL is loopback. Does not read `.env`. */
export function assertE2eDatabase(env: E2eEnv = currentEnv()): void {
  if (env.E2E_DATABASE !== "loopback") {
    throw new Error("E2E refused: set E2E_DATABASE=loopback. This suite only runs against a loopback database.");
  }
  assertHost("DATABASE_URL", env.DATABASE_URL, true);
  assertHost("DIRECT_URL", env.DIRECT_URL, false);
  if ((env.SESSION_SECRET ?? "").length < 32) {
    throw new Error("E2E refused: SESSION_SECRET must be at least 32 characters.");
  }
  if ((env.SEED_PASSWORD?.trim() ?? "").length < 8) {
    throw new Error("E2E refused: SEED_PASSWORD must be at least 8 characters.");
  }
}

function assertHost(name: string, raw: string | undefined, required: boolean): void {
  const value = raw?.trim() ?? "";
  if (!value) {
    if (required) throw new Error(`E2E refused: ${name} must be a loopback Postgres URL.`);
    return;
  }
  const host = hostname(value);
  if (!LOOPBACK_HOSTS.has(host)) {
    throw new Error(`E2E refused: ${name} host ${host} is not loopback.`);
  }
}

function currentEnv(): E2eEnv {
  return {
    E2E_DATABASE: process.env.E2E_DATABASE,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    SEED_PASSWORD: process.env.SEED_PASSWORD,
  };
}

function hostname(value: string): string {
  try {
    return new URL(value).hostname.replace(/^\[|\]$/g, "");
  } catch {
    throw new Error("E2E refused: database URL is not valid.");
  }
}
