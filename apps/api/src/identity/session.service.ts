import { createHash, randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import type { CookieOptions, Request, Response } from "express";
import { PrismaService } from "../infrastructure/prisma.service";
import type { Actor } from "./access";

const DEFAULT_SESSION_HOURS = 12;

@Injectable()
export class SessionService {
  private readonly dummyPasswordHash = argon2.hash(randomBytes(32).toString("base64url"), {
    type: argon2.argon2id,
  });

  constructor(private readonly prisma: PrismaService) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }

  async verifyLoginPassword(password: string, passwordHash: string | undefined): Promise<boolean> {
    const valid = await argon2.verify(passwordHash ?? await this.dummyPasswordHash, password);
    return passwordHash !== undefined && valid;
  }

  async open(response: Response, userId: string): Promise<void> {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const maxAge = sessionDurationMs();
    const expiresAt = new Date(Date.now() + maxAge);
    await this.prisma.session.create({ data: { userId, tokenHash, expiresAt } });
    response.cookie(this.cookieName(), token, {
      ...sessionCookieOptions(),
      maxAge,
    });
  }

  async close(request: Request, response: Response): Promise<void> {
    const token = this.readToken(request);
    if (token) {
      const tokenHash = createHash("sha256").update(token).digest("hex");
      await this.prisma.session.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    response.clearCookie(this.cookieName(), sessionCookieOptions());
  }

  async actorFrom(request: Request): Promise<Actor | null> {
    const token = this.readToken(request);
    if (!token) return null;
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) return null;
    return { id: session.user.id, role: session.user.role, clinicId: session.user.clinicId };
  }

  private readToken(request: Request): string | undefined {
    const raw: unknown = request.cookies?.[this.cookieName()];
    return typeof raw === "string" ? raw : undefined;
  }

  private cookieName(): string {
    return process.env.SESSION_COOKIE_NAME ?? "hippocrates_session";
  }
}

function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function sessionDurationMs(): number {
  const hours = Number(process.env.SESSION_TTL_HOURS ?? DEFAULT_SESSION_HOURS);
  if (!Number.isInteger(hours) || hours < 1 || hours > 168) {
    throw new Error("SESSION_TTL_HOURS must be an integer from 1 to 168");
  }
  return hours * 60 * 60 * 1000;
}
