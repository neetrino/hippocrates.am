#!/usr/bin/env node
/**
 * Fast pre-merge repository guards for Hippocrates.
 * Fail CI when secrets, structure, or locale message keys drift.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
/** @type {string[]} */
const failures = [];

function fail(message) {
  failures.push(message);
}

function requirePath(relativePath) {
  if (!existsSync(join(root, relativePath))) {
    fail(`Missing required path: ${relativePath}`);
  }
}

function trackedFiles() {
  const output = execFileSync("git", ["ls-files", "-z"], { cwd: root });
  return output
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

/** Flatten nested message objects into dotted keys. */
function flattenKeys(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  /** @type {string[]} */
  const keys = [];
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    keys.push(...flattenKeys(child, next));
  }
  return keys;
}

function assertStructure() {
  for (const path of [
    "apps/web/package.json",
    "apps/api/package.json",
    "apps/api/prisma/schema.prisma",
    "apps/api/prisma/migrations/migration_lock.toml",
    "docs/TECH_CARD.md",
    "docs/01-ARCHITECTURE.md",
    ".env.example",
    "pnpm-lock.yaml",
  ]) {
    requirePath(path);
  }
}

function assertNoTrackedSecrets() {
  const tracked = trackedFiles();
  const forbidden = tracked.filter((path) => {
    const normalized = path.replaceAll("\\", "/");
    if (normalized === ".env.example") return false;
    if (normalized === ".env" || normalized.endsWith("/.env")) return true;
    if (/(^|\/)\.env\./.test(normalized) && !normalized.endsWith(".env.example")) return true;
    if (/(^|\/)credentials\.json$/i.test(normalized)) return true;
    if (/(^|\/)id_rsa$/i.test(normalized) || /\.pem$/i.test(normalized)) return true;
    return false;
  });
  for (const path of forbidden) {
    fail(`Secret-like file is tracked by git: ${path}`);
  }
}

function assertEnvExampleHygiene() {
  const text = readFileSync(join(root, ".env.example"), "utf8");
  const mustStayEmpty = [
    "SESSION_SECRET",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "SEED_PASSWORD",
    "R2_ACCOUNT_ID",
    "R2_API_TOKEN",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_ENDPOINT",
    "R2_BUCKET",
  ];
  for (const name of mustStayEmpty) {
    const match = text.match(new RegExp(`^${name}="([^"]*)"`, "m"));
    if (!match) {
      fail(`.env.example is missing ${name}`);
      continue;
    }
    if (match[1].trim() !== "") {
      fail(`.env.example must keep ${name} empty (got a non-empty value)`);
    }
  }

  if (/neon\.tech|amazonaws\.com|supabase\.co/i.test(text)) {
    fail(".env.example must not contain hosted/production database hostnames");
  }
}

function assertLocaleParity() {
  const locales = ["hy", "ru", "en"];
  /** @type {Map<string, Set<string>>} */
  const byLocale = new Map();
  for (const locale of locales) {
    const filePath = join(root, "apps/web/messages", `${locale}.json`);
    if (!existsSync(filePath)) {
      fail(`Missing locale file: apps/web/messages/${locale}.json`);
      continue;
    }
    const json = JSON.parse(readFileSync(filePath, "utf8"));
    byLocale.set(locale, new Set(flattenKeys(json)));
  }
  if (byLocale.size !== locales.length) return;

  const [baseLocale] = locales;
  const baseKeys = byLocale.get(baseLocale);
  if (!baseKeys) return;

  for (const locale of locales.slice(1)) {
    const keys = byLocale.get(locale);
    if (!keys) continue;
    const missing = [...baseKeys].filter((key) => !keys.has(key)).sort();
    const extra = [...keys].filter((key) => !baseKeys.has(key)).sort();
    if (missing.length > 0) {
      fail(`Locale ${locale} is missing keys present in ${baseLocale}: ${missing.join(", ")}`);
    }
    if (extra.length > 0) {
      fail(`Locale ${locale} has extra keys not in ${baseLocale}: ${extra.join(", ")}`);
    }
  }
}

function assertMigrationSqlPresent() {
  const tracked = trackedFiles().map((path) => path.replaceAll("\\", "/"));
  const migrationDirs = tracked
    .filter((path) => path.startsWith("apps/api/prisma/migrations/") && path.endsWith("/migration.sql"))
    .map((path) => path.slice(0, -"/migration.sql".length));
  if (migrationDirs.length === 0) {
    fail("No Prisma migration.sql files are tracked");
  }
  for (const dir of migrationDirs) {
    if (!tracked.includes(`${dir}/migration.sql`)) {
      fail(`Migration folder missing migration.sql: ${dir}`);
    }
  }
}

assertStructure();
assertNoTrackedSecrets();
assertEnvExampleHygiene();
assertLocaleParity();
assertMigrationSqlPresent();

if (failures.length > 0) {
  console.error("Repository guard failed:\n");
  for (const message of failures) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log("Repository guard OK");
