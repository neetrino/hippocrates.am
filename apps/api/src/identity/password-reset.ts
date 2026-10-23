import { createHash, randomBytes } from "node:crypto";
import { AppError } from "../common/app-error";
import { passwordOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { deliverResetLink, resetLocale } from "./password-mail";
import { SessionService } from "./session.service";

const RESET_MS = 30 * 60 * 1000;

export type ResetRequest = "missing" | "unverified" | "sent" | "unsent";

/** Unknown addresses stay missing. An unconfirmed account does not receive a reset link. */
export async function requestPasswordReset(prisma: PrismaService, email: string, locale: unknown): Promise<ResetRequest> {
  const user = await prisma.user.findFirst({
    where: { email, disabledAt: null },
    select: {
      id: true,
      email: true,
      emailVerifications: { where: { usedAt: null }, select: { id: true }, take: 1 },
    },
  });
  if (!user) return "missing";
  if (user.emailVerifications.length > 0) return "unverified";
  const token = randomBytes(32).toString("base64url");
  await storeResetToken(prisma, user.id, token);
  const sent = await deliverResetLink(user.email, token, resetLocale(locale));
  return sent ? "sent" : "unsent";
}

async function storeResetToken(prisma: PrismaService, userId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + RESET_MS);
  await prisma.$transaction(async (tx) => {
    await tx.passwordReset.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.passwordReset.create({
      data: { userId, tokenHash: hashToken(token), expiresAt },
    });
  });
}

export async function applyPasswordReset(
  prisma: PrismaService,
  sessions: SessionService,
  token: string,
  password: unknown,
  confirmPassword: unknown,
): Promise<void> {
  const row = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { disabledAt: true, email: true } } },
  });
  if (!row || row.user.disabledAt || row.usedAt || row.expiresAt.getTime() <= Date.now()) {
    throw new AppError("RESET_INVALID", 400, "Հղումը սխալ է կամ ժամկետն անցել է");
  }
  const next = passwordOf(password, row.user.email);
  const confirm = requiredString(confirmPassword, "Կրկնել գաղտնաբառը", 128);
  if (next !== confirm) {
    throw new AppError("VALIDATION_FAILED", 400, "Գաղտնաբառերը չեն համընկնում");
  }
  const passwordHash = await sessions.hashPassword(next);
  await replacePassword(prisma, row.id, row.userId, passwordHash);
}

async function replacePassword(prisma: PrismaService, resetId: string, userId: string, passwordHash: string): Promise<void> {
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const changed = await tx.passwordReset.updateMany({
      where: { id: resetId, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });
    if (changed.count !== 1) throw new AppError("RESET_INVALID", 400, "Հղումը սխալ է կամ ժամկետն անցել է");
    await tx.user.update({ where: { id: userId }, data: { passwordHash } });
    await tx.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now } });
  });
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
