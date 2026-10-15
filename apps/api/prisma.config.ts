import { defineConfig } from "prisma/config";

/**
 * Prisma CLI (migrate / generate / validate) uses the non-pooled host.
 * Nest runtime never reads this file; it connects with DATABASE_URL via PrismaPg.
 */
function cliDatasourceUrl(): string {
  const direct = process.env.DIRECT_URL?.trim();
  const runtime = process.env.DATABASE_URL?.trim();
  const url = direct || runtime || "";
  if (url && looksPooled(url)) {
    throw new Error(
      "Prisma CLI must use DIRECT_URL (non-pooled). DATABASE_URL with a pooler host is runtime-only.",
    );
  }
  return url;
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
