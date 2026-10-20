import { AppError } from "../common/app-error";
import { recordOf } from "../common/input";
import type { PrismaService } from "../infrastructure/prisma.service";
import {
  BOOKING_DAY_MAX,
  BOOKING_DAY_MIN,
  NOTICE_MINUTE_MAX,
  PLATFORM_SETTING_ID,
  platformDefaults,
  type PlatformRules,
} from "./platform-rules";

export async function loadPlatformSettings(prisma: PrismaService): Promise<PlatformRules> {
  const row = await prisma.platformSetting.findUnique({ where: { id: PLATFORM_SETTING_ID } });
  if (!row) return platformDefaults;
  return {
    patientRegistrationEnabled: row.patientRegistrationEnabled,
    bookingEnabled: row.bookingEnabled,
    maxBookingDays: row.maxBookingDays,
    minNoticeMinutes: row.minNoticeMinutes,
    cancelDeadlineMinutes: row.cancelDeadlineMinutes,
    rescheduleDeadlineMinutes: row.rescheduleDeadlineMinutes,
  };
}

export async function savePlatformSettings(prisma: PrismaService, rules: PlatformRules): Promise<PlatformRules> {
  await prisma.platformSetting.upsert({
    where: { id: PLATFORM_SETTING_ID },
    create: { id: PLATFORM_SETTING_ID, ...rules },
    update: rules,
  });
  return rules;
}

export function platformSettingsFrom(body: unknown): PlatformRules {
  const input = recordOf(body);
  return {
    patientRegistrationEnabled: flag(input.patientRegistrationEnabled, "Հիվանդի գրանցում"),
    bookingEnabled: flag(input.bookingEnabled, "Ամրագրում"),
    maxBookingDays: boundedInt(input.maxBookingDays, "Առավելագույն օրեր", BOOKING_DAY_MIN, BOOKING_DAY_MAX),
    minNoticeMinutes: boundedInt(input.minNoticeMinutes, "Նվազագույն ծանուցում", 0, NOTICE_MINUTE_MAX),
    cancelDeadlineMinutes: boundedInt(input.cancelDeadlineMinutes, "Չեղարկման ժամ", 0, NOTICE_MINUTE_MAX),
    rescheduleDeadlineMinutes: boundedInt(input.rescheduleDeadlineMinutes, "Տեղափոխման ժամ", 0, NOTICE_MINUTE_MAX),
  };
}

function flag(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") throw new AppError("VALIDATION_FAILED", 400, `${field} սխալ է`);
  return value;
}

function boundedInt(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new AppError("VALIDATION_FAILED", 400, `${field} պետք է լինի ${min}–${max}`);
  }
  return value;
}
