import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AppError } from "../common/app-error";
import type { Role } from "../generated/prisma/client";
import type { AppRequest } from "../types/http";
import { SessionService } from "./session.service";

export const IS_PUBLIC = "isPublic";
export const ROLES = "roles";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<AppRequest>();
    const actor = await this.sessions.actorFrom(request);
    if (actor) request.actor = actor;
    if (isPublic) return true;
    if (!actor) throw new AppError("UNAUTHENTICATED", 401, "Մուտք գործեք");
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles && !roles.includes(actor.role)) {
      throw new AppError("FORBIDDEN", 403, "Այս գործողությունը թույլատրված չէ");
    }
    return true;
  }
}
