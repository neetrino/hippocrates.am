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
import { assertResetMail } from "./password-mail";
import { applyPasswordReset, requestPasswordReset } from "./password-reset";
import { saveNoticeMailPreference } from "./notice-preference";
import { changeOwnPassword, updateOwnProfile, type OwnProfile } from "./user-profile";
import { accountPhotoUrl, assertAccountPhotoOwner, clearUserPhoto, saveUserPhoto } from "./user-photo";
import { loadPlatformSettings } from "../settings/platform-settings";

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
    await this.limits.consume(`register:${request.ip ?? "unknown"}`, 5, 10 * 60 * 1000);
    const rules = await loadPlatformSettings(this.prisma);
    if (!rules.patientRegistrationEnabled) {
      throw new AppError("REGISTRATION_CLOSED", 403, "Հիվանդի գրանցումը ժամանակավորապես փակ է");
    }
    const input = recordOf(body);
    const name = personNameOf(input.name ?? input.displayName, "Անուն");
    const surname = personNameOf(input.surname, "Ազգանուն");
    const phone = requiredPhoneOf(input.phone);
    const email = emailOf(input.email);
    const password = passwordOf(input.password);
    const confirmPassword = requiredString(input.confirmPassword, "Կրկնել գաղտնաբառը", 128);
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
    await this.limits.consume(`login:${request.ip ?? "unknown"}`, 10, 60 * 1000);
    const input = recordOf(body);
    const email = emailOf(input.email);
    const password = requiredString(input.password, "Գաղտնաբառ", 128);
    const user = await this.prisma.user.findUnique({ where: { email } });
    const valid = await this.sessions.verifyLoginPassword(password, user?.passwordHash);
    if (!user || user.disabledAt || !valid) {
      throw new AppError("INVALID_LOGIN", 401, "Էլ. փոստը կամ գաղտնաբառը սխալ է");
    }
    await this.sessions.open(response, user.id);
    return { id: user.id, role: user.role };
  }

  @Public()
  @Post("forgot-password")
  async forgotPassword(@Body() body: unknown, @Req() request: Request): Promise<{ ok: true }> {
    await this.limits.consume(`forgot:${request.ip ?? "unknown"}`, 5, 10 * 60 * 1000);
    assertResetMail();
    const input = recordOf(body);
    const email = emailOf(input.email);
    await this.limits.consume(`forgot-mail:${email}`, 3, 60 * 60 * 1000);
    await requestPasswordReset(this.prisma, email, input.locale);
    return { ok: true };
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() body: unknown, @Req() request: Request): Promise<{ ok: true }> {
    await this.limits.consume(`reset:${request.ip ?? "unknown"}`, 8, 10 * 60 * 1000);
    const input = recordOf(body);
    const token = requiredString(input.token, "Հղում");
    await applyPasswordReset(this.prisma, this.sessions, token, input.password, input.confirmPassword);
    return { ok: true };
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
    const user = await this.prisma.user.findUnique({
      where: { id: actor.id },
      include: { doctorProfile: { select: { photoKey: true } } },
    });
    if (!user) throw new AppError("UNAUTHENTICATED", 401, "Մուտք գործեք");
    return {
      id: user.id,
      role: user.role,
      clinicId: user.clinicId,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      photoUrl: accountPhotoUrl(user),
      emailVisitNotices: user.emailVisitNotices,
    };
  }

  @Patch("me/notice-mail")
  async updateNoticeMail(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ emailVisitNotices: boolean }> {
    this.limits.consume(`notice-mail:${actor.id}`, 20, 10 * 60 * 1000);
    return saveNoticeMailPreference(this.prisma, actor.id, body);
  }

  @Patch("me")
  async updateProfile(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<OwnProfile> {
    await this.limits.consume(`profile:${actor.id}`, 20, 10 * 60 * 1000);
    return updateOwnProfile(this.prisma, this.sessions, actor.id, body);
  }

  @Post("me/password")
  async updatePassword(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ ok: true }> {
    await this.limits.consume(`password:${actor.id}`, 5, 10 * 60 * 1000);
    await changeOwnPassword(this.prisma, this.sessions, actor.id, body);
    return { ok: true };
  }

  @Post("me/photo")
  async uploadPhoto(@CurrentActor() actor: Actor, @Req() request: Request): Promise<{ photoUrl: string }> {
    assertAccountPhotoOwner(actor.role);
    await this.limits.consume(`photo:${actor.id}`, 10, 10 * 60 * 1000);
    const photoUrl = await saveUserPhoto(this.prisma, actor.id, request);
    return { photoUrl };
  }

  @Delete("me/photo")
  async deletePhoto(@CurrentActor() actor: Actor): Promise<{ ok: true }> {
    assertAccountPhotoOwner(actor.role);
    await this.limits.consume(`photo:${actor.id}`, 10, 10 * 60 * 1000);
    await clearUserPhoto(this.prisma, actor.id);
    return { ok: true };
  }
}
