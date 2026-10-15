import { defineConfig } from "prisma/config";

/**
 * Prisma CLI (migrate / generate / validate) uses the non-pooled host.
 * Nest runtime never reads this file; it connects with DATABASE_URL via PrismaPg.
 */
function cliDatasourceUrl(): string {
  const direct = process.env.DIRECT_URL?.trim();
  if (!direct) {
    throw new Error("Prisma CLI requires DIRECT_URL; DATABASE_URL is runtime-only.");
  }
  if (looksPooled(direct)) {
    throw new Error("Prisma CLI requires a non-pooled DIRECT_URL.");
  }
  return direct;
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
