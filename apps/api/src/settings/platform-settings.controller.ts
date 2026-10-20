import { Body, Controller, Get, Patch } from "@nestjs/common";
import { PrismaService } from "../infrastructure/prisma.service";
import { Public, Roles } from "../identity/auth.decorators";
import { loadPlatformSettings, platformSettingsFrom, savePlatformSettings } from "./platform-settings";
import type { PlatformRules } from "./platform-rules";

@Controller("platform/settings")
export class PlatformSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles("SUPER_ADMIN")
  @Get()
  read(): Promise<PlatformRules> {
    return loadPlatformSettings(this.prisma);
  }

  @Roles("SUPER_ADMIN")
  @Patch()
  update(@Body() body: unknown): Promise<PlatformRules> {
    return savePlatformSettings(this.prisma, platformSettingsFrom(body));
  }
}

@Controller("public/platform")
export class PublicPlatformController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async flags(): Promise<{ patientRegistrationEnabled: boolean; bookingEnabled: boolean }> {
    const rules = await loadPlatformSettings(this.prisma);
    return {
      patientRegistrationEnabled: rules.patientRegistrationEnabled,
      bookingEnabled: rules.bookingEnabled,
    };
  }
}
