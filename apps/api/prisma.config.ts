import { defineConfig } from "prisma/config";

/**
 * Migrations use the privileged non-pooled URL. Offline commands use a local
 * placeholder and therefore do not need runtime or migration credentials.
 */
function cliDatasourceUrl(): string {
  if (!isMigrationCommand()) {
    return "postgresql://localhost:5432/hippocrates";
  }
  const direct = process.env.DIRECT_URL?.trim();
  if (!direct) {
    throw new Error("Prisma CLI requires DIRECT_URL; DATABASE_URL is runtime-only.");
  }
  if (looksPooled(direct)) {
    throw new Error("Prisma CLI requires a non-pooled DIRECT_URL.");
  }
  return direct;
}

function isMigrationCommand(): boolean {
  return process.argv.some((argument) => argument === "migrate" || argument.startsWith("migrate:"));
}

function looksPooled(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes("-pooler") || lower.includes("pgbouncer=true");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: cliDatasourceUrl(),
  },
});
