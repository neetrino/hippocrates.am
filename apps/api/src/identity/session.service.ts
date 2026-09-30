import { createHash, randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import type { Request, Response } from "express";
import { AppError } from "../common/app-error";
import { PrismaService } from "../infrastructure/prisma.service";
import type { Actor } from "./access";

const SESSION_MS = 12 * 60 * 60 * 1000;

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }

  async open(response: Response, userId: string): Promise<void> {
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + SESSION_MS);
    await this.prisma.session.create({ data: { userId, tokenHash, expiresAt } });
    response.cookie(this.cookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MS,
      path: "/",
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
    response.clearCookie(this.cookieName(), { path: "/" });
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

export function assertSessionSecret(): void {
  if ((process.env.SESSION_SECRET ?? "").length < 32) {
    throw new AppError("CONFIG", 500, "SESSION_SECRET is missing");
  }
}
