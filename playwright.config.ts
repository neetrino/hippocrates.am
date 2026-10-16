import { defineConfig } from "@playwright/test";
import { assertE2eDatabase } from "./apps/api/src/e2e/database-guard";

assertE2eDatabase();

const blocked = new Set([
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_API_TOKEN",
  "R2_ACCOUNT_ID",
  "R2_ENDPOINT",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
  "SUPER_ADMIN_PASSWORD",
  "SUPER_ADMIN_EMAIL",
]);

const apiPort = portOf("E2E_API_PORT", 4000);
const webPort = portOf("E2E_WEB_PORT", 3000);
const apiUrl = `http://127.0.0.1:${apiPort}`;
const webUrl = `http://127.0.0.1:${webPort}`;
const env = childEnv(apiUrl, webUrl, apiPort);

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  timeout: 360_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: webUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: [
    {
      command: "pnpm --filter @hippocrates/api exec node ./scripts/dev-watch.cjs",
      url: `${apiUrl}/health`,
      timeout: 180_000,
      reuseExistingServer: false,
      env,
    },
    {
      command: `pnpm --filter @hippocrates/web exec next dev --webpack -H 127.0.0.1 -p ${webPort}`,
      url: `${webUrl}/en/login`,
      timeout: 180_000,
      reuseExistingServer: false,
      env,
    },
  ],
});

function childEnv(api: string, web: string, port: number): Record<string, string> {
  const source: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && !blocked.has(key)) source[key] = value;
  }
  source.DATABASE_URL = required("DATABASE_URL");
  source.DIRECT_URL = process.env.DIRECT_URL?.trim() || source.DATABASE_URL;
  source.E2E_DATABASE = "loopback";
  source.SESSION_SECRET = required("SESSION_SECRET");
  source.SEED_PASSWORD = required("SEED_PASSWORD");
  source.WEB_URL = web;
  source.API_URL = api;
  source.NEXT_PUBLIC_API_URL = api;
  source.API_PORT = String(port);
  source.E2E_NEXT_DIST = ".next-e2e";
  source.NODE_ENV = "development";
  return source;
}

function required(name: string): string {
  const value = process.env[name]?.trim() ?? "";
  if (!value) throw new Error(`E2E refused: ${name} is missing.`);
  return value;
}

function portOf(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`E2E refused: ${name} is not a valid port.`);
  }
  return parsed;
}
