import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import { DATABASE_POOL } from "./database-pool";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(DATABASE_POOL) pool: Pool) {
    super({ adapter: new PrismaPg(pool, { disposeExternalPool: true }) });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
