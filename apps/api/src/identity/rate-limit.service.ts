import { createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { PrismaService } from "../infrastructure/prisma.service";

type RateLimitRow = { count: number };

const CLEANUP_INTERVAL_MS = 60_000;

@Injectable()
export class RateLimitService {
  private nextCleanupAt = 0;

  constructor(private readonly prisma: PrismaService) {}

  async consume(key: string, limit: number, windowMs: number): Promise<void> {
    const now = Date.now();
    await this.cleanupExpired(now);
    const instant = new Date(now);
    const expiresAt = new Date(now + windowMs);
    const bucketKey = createHash("sha256").update(key).digest("hex");
    const rows = await this.prisma.$queryRaw<RateLimitRow[]>`
      INSERT INTO "RateLimitBucket" ("key", "windowStart", "count", "expiresAt")
      VALUES (${bucketKey}, ${instant}, 1, ${expiresAt})
      ON CONFLICT ("key") DO UPDATE SET
        "windowStart" = CASE WHEN "RateLimitBucket"."expiresAt" <= ${instant} THEN ${instant} ELSE "RateLimitBucket"."windowStart" END,
        "count" = CASE WHEN "RateLimitBucket"."expiresAt" <= ${instant} THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
        "expiresAt" = CASE WHEN "RateLimitBucket"."expiresAt" <= ${instant} THEN ${expiresAt} ELSE "RateLimitBucket"."expiresAt" END
      RETURNING "count"
    `;
    if ((rows[0]?.count ?? limit + 1) > limit) {
      throw new AppError("RATE_LIMITED", 429, "Չափից շատ հարցում");
    }
  }

  private async cleanupExpired(now: number): Promise<void> {
    if (now < this.nextCleanupAt) return;
    this.nextCleanupAt = now + CLEANUP_INTERVAL_MS;
    await this.prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lte: new Date(now) } } });
  }
}
