import { createHash, randomBytes } from "node:crypto";
import { AppError } from "../common/app-error";
import { passwordOf } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { deliverResetLink, resetLocale } from "./password-mail";
import { SessionService } from "./session.service";

const RESET_MS = 30 * 60 * 1000;

export async function requestPasswordReset(prisma: PrismaService, email: string, locale: unknown): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { email, disabledAt: null },
    select: { id: true, email: true },
  });
  if (!user) return;
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_MS);
  await prisma.$transaction(async (tx) => {
    await tx.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.passwordReset.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt },
    });
  });
  await deliverResetLink(user.email, token, resetLocale(locale));
}

export async function applyPasswordReset(
  prisma: PrismaService,
  sessions: SessionService,
  token: string,
  password: unknown,
  confirmPassword: unknown,
): Promise<void> {
  const next = passwordOf(password);
  if (next !== passwordOf(confirmPassword)) {
    throw new AppError("VALIDATION_FAILED", 400, "Գաղտնաբառերը չեն համընկնում");
  }
  const row = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { disabledAt: true } } },
  });
  if (!row || row.user.disabledAt || row.usedAt || row.expiresAt.getTime() <= Date.now()) {
    throw new AppError("RESET_INVALID", 400, "Հղումը սխալ է կամ ժամկետն անցել է");
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
