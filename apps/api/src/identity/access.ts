import { AppError } from "../common/app-error";
import type { Role } from "../generated/prisma/client";

export type Actor = {
  id: string;
  role: Role;
  clinicId: string | null;
};

export function requireRoles(actor: Actor, roles: readonly Role[]): void {
  if (!roles.includes(actor.role)) {
    throw new AppError("FORBIDDEN", 403, "Այս գործողությունը թույլատրված չէ");
  }
}

export function requireClinicAdmin(actor: Actor, clinicId: string): void {
  if (actor.role !== "ADMIN" || actor.clinicId !== clinicId) {
    throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
  }
}
