import { Global, Module } from "@nestjs/common";
import { createDatabasePool, DATABASE_POOL } from "./database-pool";
import { DatabaseIdleService } from "./database-idle.service";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: (): ReturnType<typeof createDatabasePool> => {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
          throw new Error("DATABASE_URL is required");
        }
        return createDatabasePool(connectionString);
      },
    },
    PrismaService,
    DatabaseIdleService,
  ],
  exports: [PrismaService, DatabaseIdleService],
})
export class PrismaModule {}
