import { AppError } from "../common/app-error";
import { recordOf } from "../common/input";
import type { PrismaService } from "../infrastructure/prisma.service";

/** Saves whether visit notices also go by email. */
export async function saveNoticeMailPreference(
  prisma: PrismaService,
  userId: string,
  body: unknown,
): Promise<{ emailVisitNotices: boolean }> {
  const input = recordOf(body);
  if (typeof input.emailVisitNotices !== "boolean") {
    throw new AppError("VALIDATION_FAILED", 400, "Ծանուցումը սխալ է");
  }
  return prisma.user.update({
    where: { id: userId },
    data: { emailVisitNotices: input.emailVisitNotices },
    select: { emailVisitNotices: true },
  });
}
