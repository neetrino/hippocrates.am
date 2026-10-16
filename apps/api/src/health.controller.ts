import { Controller, Get } from "@nestjs/common";
import { Public } from "./identity/auth.decorators";
import { PrismaService } from "./infrastructure/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async health(): Promise<{ ok: true }> {
    return this.ready();
  }

  @Public()
  @Get("live")
  live(): { ok: true } {
    return { ok: true };
  }

  @Public()
  @Get("ready")
  async ready(): Promise<{ ok: true }> {
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  }
}
