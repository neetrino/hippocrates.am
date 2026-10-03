import { AppError } from "../common/app-error";
import { displayNameOf, emailOf, namePartOf, optionalPhoneOf, passwordOf, recordOf, requiredString } from "../common/input";
import type { PrismaService } from "../infrastructure/prisma.service";
import type { SessionService } from "./session.service";

export type OwnProfile = {
  displayName: string;
  email: string;
  phone: string | null;
};

/** Updates name, surname, email, and phone. Email changes require the current password. */
export async function updateOwnProfile(
  prisma: PrismaService,
  sessions: SessionService,
  userId: string,
  body: unknown,
): Promise<OwnProfile> {
  const input = recordOf(body);
  const displayName = displayNameOf(`${namePartOf(input.name, "Անուն")} ${namePartOf(input.surname, "Ազգանուն")}`);
  const email = emailOf(input.email);
  const phone = optionalPhoneOf(input.phone);
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, passwordHash: true },
  });
  if (!current) throw new AppError("UNAUTHENTICATED", 401, "Մուտք գործեք");
  if (email !== current.email) {
    await assertEmailChange(prisma, sessions, current.passwordHash, email, input.currentPassword);
  }
  return prisma.user.update({
    where: { id: userId },
    data: { displayName, email, phone },
    select: { displayName: true, email: true, phone: true },
  });
}

async function assertEmailChange(
  prisma: PrismaService,
  sessions: SessionService,
  passwordHash: string,
  email: string,
  currentPassword: unknown,
): Promise<void> {
  const password = requiredString(currentPassword, "Ընթացիկ գաղտնաբառ");
  const valid = await sessions.verifyPassword(password, passwordHash);
  if (!valid) throw new AppError("VALIDATION_FAILED", 400, "Ընթացիկ գաղտնաբառը սխալ է");
  const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (taken) throw new AppError("EMAIL_TAKEN", 409, "Այս էլ. փոստը արդեն գրանցված է");
}

/** Replaces the password after the current one matches. */
export async function changeOwnPassword(
  prisma: PrismaService,
  sessions: SessionService,
  userId: string,
  body: unknown,
): Promise<void> {
  const input = recordOf(body);
  const current = requiredString(input.currentPassword, "Ընթացիկ գաղտնաբառ");
  const password = passwordOf(input.password);
  const confirm = requiredString(input.confirmPassword, "Կրկնել գաղտնաբառը");
  if (password !== confirm) {
    throw new AppError("VALIDATION_FAILED", 400, "Գաղտնաբառերը չեն համընկնում");
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) throw new AppError("UNAUTHENTICATED", 401, "Մուտք գործեք");
  const valid = await sessions.verifyPassword(current, user.passwordHash);
  if (!valid) throw new AppError("VALIDATION_FAILED", 400, "Ընթացիկ գաղտնաբառը սխալ է");
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await sessions.hashPassword(password) },
  });
}
