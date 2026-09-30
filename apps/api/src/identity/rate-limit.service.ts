import { Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error";

type Hit = { at: number };

@Injectable()
export class RateLimitService {
  private readonly hits = new Map<string, Hit[]>();

  consume(key: string, limit: number, windowMs: number): void {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((hit) => now - hit.at < windowMs);
    if (recent.length >= limit) {
      throw new AppError("RATE_LIMITED", 429, "Չափից շատ հարցում");
    }
    recent.push({ at: now });
    this.hits.set(key, recent);
  }
}
