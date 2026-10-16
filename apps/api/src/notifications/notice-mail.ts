import { Logger } from "@nestjs/common";
import type { Prisma } from "../generated/prisma/client";
import type { PrismaService } from "../infrastructure/prisma.service";
import { mailConfigured, sendMail } from "../infrastructure/send-mail";
import { MAIL_ATTEMPTS, nextMailAttempt } from "./notice-mail-attempt";
import { noticeLetter, noticesHref } from "./notice-letter";

const MAIL_BATCH = 20;
const logger = new Logger("NoticeMail");

const pendingSelect = {
  id: true,
  attempts: true,
  notification: {
    select: {
      body: true,
      detail: true,
      user: { select: { email: true, role: true, emailVisitNotices: true } },
      appointment: {
        select: {
          startsAt: true,
          clinic: { select: { name: true } },
          doctor: { select: { user: { select: { displayName: true } } } },
        },
      },
    },
  },
} as const satisfies Prisma.NoticeMailSelect;

type PendingMail = Prisma.NoticeMailGetPayload<{ select: typeof pendingSelect }>;
type MailDb = PrismaService | Prisma.TransactionClient;

type NoticeDraft = {
  userId: string;
  appointmentId: string;
  body: string;
  detail?: string | null;
  dedupeKey: string;
};

/** Writes in-app notices, then queues mail for accounts that still want email. */
export async function saveNotices(prisma: MailDb, data: readonly NoticeDraft[]): Promise<void> {
  if (data.length === 0) return;
  await prisma.notification.createMany({ data: [...data], skipDuplicates: true });
  const stored = await prisma.notification.findMany({
    where: { dedupeKey: { in: data.map((row) => row.dedupeKey) } },
    select: { id: true, userId: true },
  });
  await queueNoticeMails(prisma, stored);
}

/** One delivery row per in-app notice, only for accounts that still want email. */
export async function queueNoticeMails(
  prisma: MailDb,
  notices: readonly { id: string; userId: string }[],
): Promise<void> {
  if (notices.length === 0) return;
  const optedIn = await prisma.user.findMany({
    where: { id: { in: notices.map((notice) => notice.userId) }, emailVisitNotices: true },
    select: { id: true },
  });
  const allowed = new Set(optedIn.map((user) => user.id));
  const data = notices.filter((notice) => allowed.has(notice.userId)).map((notice) => ({ notificationId: notice.id }));
  if (data.length === 0) return;
  await prisma.noticeMail.createMany({ data, skipDuplicates: true });
}

/** Sends a bounded batch. A failed letter stays pending until the attempt cap. */
export async function deliverPendingNoticeMails(prisma: PrismaService): Promise<void> {
  const pending = await prisma.noticeMail.findMany({
    where: { status: "PENDING", attempts: { lt: MAIL_ATTEMPTS } },
    orderBy: { createdAt: "asc" },
    take: MAIL_BATCH,
    select: pendingSelect,
  });
  if (pending.length === 0) return;
  if (!mailConfigured() && process.env.NODE_ENV === "production") {
    logger.error("Visit mail is not configured");
    return;
  }
  for (const row of pending) {
    try {
      await deliverNoticeMail(prisma, row);
    } catch (error) {
      logger.error("Visit notice mail failed", error instanceof Error ? error.stack : undefined);
    }
  }
}

async function deliverNoticeMail(prisma: PrismaService, row: PendingMail): Promise<void> {
  try {
    const user = row.notification.user;
    if (!user.emailVisitNotices) {
      await prisma.noticeMail.update({ where: { id: row.id }, data: { status: "SKIPPED" } });
      return;
    }
    const letter = visitLetter(row);
    if (!mailConfigured()) {
      logger.log(`Visit notice for ${user.email}: ${letter.subject}`);
      await markMail(prisma, row.id, { status: "SENT", attempts: row.attempts, sentAt: new Date() });
      return;
    }
    const accepted = await sendMail({ to: user.email, subject: letter.subject, text: letter.text });
    const next = nextMailAttempt(accepted, row.attempts);
    await markMail(prisma, row.id, { ...next, sentAt: next.status === "SENT" ? new Date() : null });
    if (!accepted) logger.error("Visit notice mail was not accepted");
  } catch (error) {
    logger.error("Visit notice mail failed", error instanceof Error ? error.stack : undefined);
    const next = nextMailAttempt(false, row.attempts);
    await markMail(prisma, row.id, { ...next, sentAt: null });
  }
}

function visitLetter(row: PendingMail): { subject: string; text: string } {
  const visit = row.notification.appointment;
  return noticeLetter({
    body: row.notification.body,
    detail: row.notification.detail,
    clinic: visit?.clinic.name ?? "",
    doctor: visit?.doctor.user.displayName ?? "",
    startsAt: visit?.startsAt ?? null,
    href: noticesHref(row.notification.user.role),
  });
}

function markMail(
  prisma: PrismaService,
  id: string,
  data: { status: "SENT" | "PENDING" | "FAILED"; attempts: number; sentAt: Date | null },
): Promise<unknown> {
  return prisma.noticeMail.update({ where: { id }, data });
}
