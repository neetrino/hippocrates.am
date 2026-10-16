import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { createDatabasePool } from "../infrastructure/database-pool";
import { assertE2eDatabase } from "./database-guard";

/** Opens Prisma only after the loopback guard accepts the process environment. */
export function openLoopbackDb(): PrismaClient {
  assertE2eDatabase();
  const url = process.env.DATABASE_URL?.trim() ?? "";
  return new PrismaClient({
    adapter: new PrismaPg(createDatabasePool(url), { disposeExternalPool: true }),
  });
}
