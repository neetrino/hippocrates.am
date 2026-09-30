import "reflect-metadata";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import * as argon2 from "argon2";

async function seed(): Promise<void> {
  const email = process.env.SUPER_ADMIN_EMAIL ?? "";
  const password = process.env.SUPER_ADMIN_PASSWORD ?? "";
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !email || password.length < 8) {
    throw new Error("SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD and DATABASE_URL are required");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        displayName: "Super Admin",
        role: "SUPER_ADMIN",
        passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
      },
    });
  }
  await prisma.$disconnect();
}

void seed();
