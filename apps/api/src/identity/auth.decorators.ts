import { SetMetadata } from "@nestjs/common";
import type { Role } from "../generated/prisma/client";
import { IS_PUBLIC, ROLES } from "./auth.guard";

export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC, true);

export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator => SetMetadata(ROLES, roles);
