const R2_NAMES = [
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
] as const;

/** Rejects incomplete or insecure runtime configuration before the API starts. */
export function validateRuntimeEnvironment(env: NodeJS.ProcessEnv = process.env): void {
  requirePostgresUrl(env.DATABASE_URL);
  optionalPositiveInteger("API_PORT", env.API_PORT, 65_535);
  optionalPositiveInteger("SESSION_TTL_HOURS", env.SESSION_TTL_HOURS);
  optionalPositiveInteger("DATABASE_CONNECTION_LIMIT", env.DATABASE_CONNECTION_LIMIT);
  optionalPositiveInteger("DATABASE_POOL_TIMEOUT", env.DATABASE_POOL_TIMEOUT);
  requirePair("RESEND_API_KEY", env.RESEND_API_KEY, "MAIL_FROM", env.MAIL_FROM);
  requireCompleteGroup(env, R2_NAMES);
  if (env.NODE_ENV !== "production") return;
  requireHttpsOrigin("WEB_URL", env.WEB_URL);
  requireHttpsUrl("R2_PUBLIC_URL", env.R2_PUBLIC_URL);
  requireValue("RESEND_API_KEY", env.RESEND_API_KEY);
  requireValue("MAIL_FROM", env.MAIL_FROM);
  for (const name of R2_NAMES) requireValue(name, env[name]);
}

function requirePostgresUrl(value: string | undefined): void {
  const url = parsedUrl("DATABASE_URL", value);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("DATABASE_URL must use PostgreSQL");
  }
}

function requireHttpsOrigin(name: string, value: string | undefined): void {
  const url = parsedUrl(name, value);
  if (url.protocol !== "https:" || url.origin !== url.toString().replace(/\/$/, "")) {
    throw new Error(`${name} must be an HTTPS origin without a path`);
  }
}

function requireHttpsUrl(name: string, value: string | undefined): void {
  const url = parsedUrl(name, value);
  if (url.protocol !== "https:") throw new Error(`${name} must use HTTPS`);
}

function parsedUrl(name: string, value: string | undefined): URL {
  const present = requireValue(name, value);
  try {
    return new URL(present);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
}

function requirePair(firstName: string, first: string | undefined, secondName: string, second: string | undefined): void {
  if (Boolean(first?.trim()) !== Boolean(second?.trim())) {
    throw new Error(`${firstName} and ${secondName} must be configured together`);
  }
}

function requireCompleteGroup(env: NodeJS.ProcessEnv, names: readonly string[]): void {
  const count = names.filter((name) => env[name]?.trim()).length;
  if (count !== 0 && count !== names.length) throw new Error(`${names.join(", ")} must be configured together`);
}

function optionalPositiveInteger(name: string, value: string | undefined, max?: number): void {
  if (!value?.trim()) return;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || (max !== undefined && parsed > max)) {
    throw new Error(`${name} must be a positive integer`);
  }
}

function requireValue(name: string, value: string | undefined): string {
  const present = value?.trim() ?? "";
  if (!present) throw new Error(`${name} is required`);
  return present;
}
