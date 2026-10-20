import { createHash, randomBytes } from "node:crypto";
import { AppError } from "../common/app-error";
import { PrismaService } from "../infrastructure/prisma.service";
import { deliverVerificationLink } from "./email-verify-mail";
import { resetLocale } from "./password-link";

const VERIFY_MS = 24 * 60 * 60 * 1000;

/** Sends a fresh link when the address exists and is still unconfirmed. */
export async function issueEmailVerification(prisma: PrismaService, email: string, locale: unknown): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { email, disabledAt: null, emailVerifiedAt: null },
    select: { id: true, email: true },
  });
  if (!user) return;
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + VERIFY_MS);
  await storeVerification(prisma, user.id, token, expiresAt);
  await deliverVerificationLink(user.email, token, resetLocale(locale));
}

export async function confirmEmailAddress(prisma: PrismaService, token: string): Promise<string> {
  const row = await prisma.emailVerification.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      userId: true,
      usedAt: true,
      expiresAt: true,
      user: { select: { disabledAt: true } },
    },
  });
  if (!row || row.user.disabledAt || row.usedAt || row.expiresAt.getTime() <= Date.now()) {
    throw new AppError("VERIFY_INVALID", 400, "Հղումը սխալ է կամ ժամկետն անցել է");
  }
  await markEmailVerified(prisma, row.id, row.userId);
  return row.userId;
}

async function storeVerification(prisma: PrismaService, userId: string, token: string, expiresAt: Date): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.emailVerification.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.emailVerification.create({
      data: { userId, tokenHash: hashToken(token), expiresAt },
    });
  });
}

async function markEmailVerified(prisma: PrismaService, verificationId: string, userId: string): Promise<void> {
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const changed = await tx.emailVerification.updateMany({
      where: { id: verificationId, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (changed.count !== 1) throw new AppError("VERIFY_INVALID", 400, "Հղումը սխալ է կամ ժամկետն անցել է");
    await tx.user.update({ where: { id: userId }, data: { emailVerifiedAt: now } });
  });
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
