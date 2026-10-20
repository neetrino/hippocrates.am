import { createHash, randomBytes } from "node:crypto";
import { AppError } from "../common/app-error";
import { PrismaService } from "../infrastructure/prisma.service";
import { deliverVerificationLink } from "./email-verify-mail";
import { resetLocale } from "./password-link";

const VERIFY_MS = 24 * 60 * 60 * 1000;

type NewPatient = {
  email: string;
  phone: string;
  displayName: string;
  passwordHash: string;
};

/** Creates the patient and the confirmation together. Existing accounts are not written. */
export async function openUnconfirmedPatient(
  prisma: PrismaService,
  data: NewPatient,
  locale: unknown,
): Promise<{ id: string }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + VERIFY_MS);
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({ data: { ...data, role: "PATIENT" } });
    await tx.emailVerification.create({
      data: { userId: created.id, tokenHash: hashToken(token), expiresAt },
    });
    return created;
  });
  await deliverVerificationLink(user.email, token, resetLocale(locale));
  return { id: user.id };
}

/** Sends a fresh link only when that account still has an unused confirmation. */
export async function issueEmailVerification(prisma: PrismaService, email: string, locale: unknown): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { email, disabledAt: null, emailVerifications: { some: { usedAt: null } } },
    select: { id: true, email: true },
  });
  if (!user) return;
  await sendFreshLink(prisma, user.id, user.email, locale);
}

export async function confirmEmailAddress(prisma: PrismaService, token: string): Promise<string> {
  const row = await findOpenVerification(prisma, token);
  await markEmailVerified(prisma, row.id, row.userId);
  return row.userId;
}

export async function emailConfirmationPending(prisma: PrismaService, userId: string): Promise<boolean> {
  const pending = await prisma.emailVerification.findFirst({
    where: { userId, usedAt: null },
    select: { id: true },
  });
  return pending !== null;
}

async function sendFreshLink(prisma: PrismaService, userId: string, email: string, locale: unknown): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + VERIFY_MS);
  await storeVerification(prisma, userId, token, expiresAt);
  await deliverVerificationLink(email, token, resetLocale(locale));
}

async function findOpenVerification(prisma: PrismaService, token: string): Promise<{ id: string; userId: string }> {
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
  return { id: row.id, userId: row.userId };
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
    await tx.emailVerification.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: now },
    });
  });
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
