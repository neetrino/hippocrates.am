import { Body, Controller, Delete, Get, Patch, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AppError } from "../common/app-error";
import { emailOf, passwordOf, personNameOf, recordOf, requiredPhoneOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import type { Actor } from "./access";
import { Public } from "./auth.decorators";
import { CurrentActor } from "./current-actor";
import { RateLimitService } from "./rate-limit.service";
import { SessionService } from "./session.service";
import { changeOwnPassword, updateOwnProfile, type OwnProfile } from "./user-profile";
import { clearUserPhoto, saveUserPhoto } from "./user-photo";
import { publicAssetUrl } from "../infrastructure/r2.storage";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
    private readonly limits: RateLimitService,
  ) {}

  @Public()
  @Post("register")
  async register(
    @Body() body: unknown,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ id: string }> {
    this.limits.consume(`register:${request.ip ?? "unknown"}`, 5, 10 * 60 * 1000);
    const input = recordOf(body);
    const name = personNameOf(input.name ?? input.displayName, "Անուն");
    const surname = personNameOf(input.surname, "Ազգանուն");
    const phone = requiredPhoneOf(input.phone);
    const email = emailOf(input.email);
    const password = passwordOf(input.password);
    const confirmPassword = requiredString(input.confirmPassword, "Կրկնել գաղտնաբառը");
    if (password !== confirmPassword) {
      throw new AppError("VALIDATION_FAILED", 400, "Գաղտնաբառերը չեն համընկնում");
    }
    const displayName = `${name} ${surname}`.replace(/\s+/g, " ").trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("EMAIL_TAKEN", 409, "Այս էլ. փոստը արդեն գրանցված է");
    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        displayName,
        passwordHash: await this.sessions.hashPassword(password),
        role: "PATIENT",
      },
    });
    await this.sessions.open(response, user.id);
    return { id: user.id };
  }

  @Public()
  @Post("login")
  async login(
    @Body() body: unknown,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ id: string; role: string }> {
    this.limits.consume(`login:${request.ip ?? "unknown"}`, 10, 60 * 1000);
    const input = recordOf(body);
    const email = emailOf(input.email);
    const password = requiredString(input.password, "Գաղտնաբառ");
    const user = await this.prisma.user.findUnique({ where: { email } });
    const valid = user ? await this.sessions.verifyPassword(password, user.passwordHash) : false;
    if (!user || !valid) throw new AppError("INVALID_LOGIN", 401, "Էլ. փոստը կամ գաղտնաբառը սխալ է");
    await this.sessions.open(response, user.id);
    return { id: user.id, role: user.role };
  }

  @Public()
  @Post("logout")
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<{ ok: true }> {
    await this.sessions.close(request, response);
    return { ok: true };
  }

  @Get("me")
  async me(
    @CurrentActor() actor: Actor,
  ): Promise<Actor & { displayName: string; email: string; phone: string | null; photoUrl: string | null; emailVisitNotices: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { id: actor.id } });
    if (!user) throw new AppError("UNAUTHENTICATED", 401, "Մուտք գործեք");
    return {
      id: user.id,
      role: user.role,
      clinicId: user.clinicId,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      photoUrl: publicAssetUrl(user.photoKey),
      emailVisitNotices: user.emailVisitNotices,
    };
  }

  @Patch("me")
  async updateProfile(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<OwnProfile> {
    this.limits.consume(`profile:${actor.id}`, 20, 10 * 60 * 1000);
    return updateOwnProfile(this.prisma, this.sessions, actor.id, body);
  }

  @Post("me/password")
  async updatePassword(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ ok: true }> {
    this.limits.consume(`password:${actor.id}`, 5, 10 * 60 * 1000);
    await changeOwnPassword(this.prisma, this.sessions, actor.id, body);
    return { ok: true };
  }

  @Post("me/photo")
  async uploadPhoto(@CurrentActor() actor: Actor, @Req() request: Request): Promise<{ photoUrl: string }> {
    this.limits.consume(`photo:${actor.id}`, 10, 10 * 60 * 1000);
    const photoUrl = await saveUserPhoto(this.prisma, actor.id, request);
    return { photoUrl };
  }

  @Delete("me/photo")
  async deletePhoto(@CurrentActor() actor: Actor): Promise<{ ok: true }> {
    this.limits.consume(`photo:${actor.id}`, 10, 10 * 60 * 1000);
    await clearUserPhoto(this.prisma, actor.id);
    return { ok: true };
  }
}
