import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { AppError } from "../common/app-error";
import type { Actor } from "./access";

export const CurrentActor = createParamDecorator((_data: unknown, context: ExecutionContext): Actor => {
  const request = context.switchToHttp().getRequest<Request>();
  if (!request.actor) throw new AppError("UNAUTHENTICATED", 401, "Մուտք գործեք");
  return request.actor;
});
