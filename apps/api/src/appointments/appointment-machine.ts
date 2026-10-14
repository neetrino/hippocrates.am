import { AppError } from "../common/app-error";
import type {
  Appointment,
  AppointmentActorRole,
  AppointmentStatus,
  Prisma,
  Role,
} from "../generated/prisma/client";

export type VisitActor = {
  userId: string | null;
  role: Role | "SYSTEM";
};

export type TransitionCommand =
  | { type: "CONFIRMED" }
  | { type: "CANCELLED"; reason: string | null }
  | { type: "COMPLETED" }
  | { type: "NO_SHOW" }
  | { type: "EXPIRED" }
  | {
      type: "RESCHEDULED";
      startsAt: Date;
      endsAt: Date;
      status: "REQUESTED" | "CONFIRMED";
      proposedBy: "PATIENT" | "STAFF";
    };

export type VisitSnapshot = {
  id: string;
  status: AppointmentStatus;
  startsAt: Date;
  endsAt: Date;
};

type TimeGate = "before-start" | "after-start";
type CommandType = TransitionCommand["type"];

const fromOf: Record<CommandType, readonly AppointmentStatus[]> = {
  CONFIRMED: ["REQUESTED"],
  CANCELLED: ["REQUESTED", "CONFIRMED"],
  COMPLETED: ["CONFIRMED"],
  NO_SHOW: ["CONFIRMED"],
  EXPIRED: ["REQUESTED"],
  RESCHEDULED: ["REQUESTED", "CONFIRMED"],
};

const gateOf: Record<CommandType, TimeGate> = {
  CONFIRMED: "before-start",
  CANCELLED: "before-start",
  RESCHEDULED: "before-start",
  COMPLETED: "after-start",
  NO_SHOW: "after-start",
  EXPIRED: "after-start",
};

const slotPassed = new AppError("VISIT_STARTED", 409, "Ժամն արդեն անցել է");
const visitStarted = new AppError("VISIT_STARTED", 409, "Այցն արդեն սկսվել է");
const notStarted = new AppError("VISIT_NOT_STARTED", 409, "Այցը դեռ չի սկսվել");
const missing = new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");

export const systemActor: VisitActor = { userId: null, role: "SYSTEM" };

export function visitActor(actor: { id: string; role: Role }): VisitActor {
  return { userId: actor.id, role: actor.role };
}

export function toStatusOf(command: TransitionCommand): AppointmentStatus {
  return command.type === "RESCHEDULED" ? command.status : command.type;
}

export function transitionOf(command: TransitionCommand): {
  from: readonly AppointmentStatus[];
  to: AppointmentStatus;
  gate: TimeGate;
} {
  return { from: fromOf[command.type], to: toStatusOf(command), gate: gateOf[command.type] };
}

export function assertTransition(current: VisitSnapshot, command: TransitionCommand, now: Date): void {
  if (!fromOf[command.type].includes(current.status)) throw missing;
  const begun = current.startsAt.getTime() <= now.getTime();
  if (gateOf[command.type] === "before-start" && begun) throw lateError(command.type);
  if (gateOf[command.type] === "after-start" && !begun) throw earlyError(command.type);
}

export async function appendCreated(
  tx: Prisma.TransactionClient,
  appointment: { id: string; status: AppointmentStatus; startsAt: Date },
  actor: VisitActor,
): Promise<void> {
  await tx.appointmentEvent.create({
    data: {
      appointmentId: appointment.id,
      type: "CREATED",
      toStatus: appointment.status,
      actorUserId: actor.userId,
      actorRole: eventRole(actor.role),
      toStartsAt: appointment.startsAt,
    },
  });
}

export async function applyTransition(
  tx: Prisma.TransactionClient,
  current: VisitSnapshot,
  command: TransitionCommand,
  actor: VisitActor,
  now: Date,
): Promise<Appointment> {
  assertTransition(current, command, now);
  const changed = await tx.appointment.updateMany({
    where: whereOf(current.id, command, now),
    data: patchOf(command),
  });
  if (changed.count !== 1) throw casError(command);
  await appendEvent(tx, current, command, actor);
  return tx.appointment.findUniqueOrThrow({ where: { id: current.id } });
}

export async function tryExpire(
  tx: Prisma.TransactionClient,
  current: VisitSnapshot,
  now: Date,
): Promise<Appointment | null> {
  if (current.status !== "REQUESTED" || current.startsAt.getTime() > now.getTime()) return null;
  const changed = await tx.appointment.updateMany({
    where: { id: current.id, status: "REQUESTED" },
    data: { status: "EXPIRED" },
  });
  if (changed.count !== 1) return null;
  await appendEvent(tx, current, { type: "EXPIRED" }, systemActor);
  return tx.appointment.findUniqueOrThrow({ where: { id: current.id } });
}

function patchOf(command: TransitionCommand): {
  status: AppointmentStatus;
  cancelReason?: string | null;
  startsAt?: Date;
  endsAt?: Date;
  proposedBy?: "PATIENT" | "STAFF";
} {
  if (command.type === "CANCELLED") return { status: "CANCELLED", cancelReason: command.reason };
  if (command.type === "RESCHEDULED") {
    return {
      status: command.status,
      startsAt: command.startsAt,
      endsAt: command.endsAt,
      proposedBy: command.proposedBy,
    };
  }
  return { status: command.type };
}

function whereOf(id: string, command: TransitionCommand, now: Date) {
  const status = { in: [...fromOf[command.type]] };
  if (command.type === "RESCHEDULED" || command.type === "EXPIRED") return { id, status };
  if (gateOf[command.type] === "before-start") return { id, status, startsAt: { gt: now } };
  return { id, status, startsAt: { lte: now } };
}

function lateError(type: CommandType): AppError {
  return type === "CONFIRMED" ? slotPassed : visitStarted;
}

function earlyError(type: CommandType): AppError {
  return type === "COMPLETED" || type === "NO_SHOW" ? notStarted : missing;
}

function casError(command: TransitionCommand): AppError {
  if (command.type === "COMPLETED" || command.type === "NO_SHOW" || command.type === "RESCHEDULED") return missing;
  return lateError(command.type);
}

function eventRole(role: Role | "SYSTEM"): AppointmentActorRole {
  if (role === "SYSTEM" || role === "PATIENT" || role === "DOCTOR") return role;
  return "ADMIN";
}

async function appendEvent(
  tx: Prisma.TransactionClient,
  current: VisitSnapshot,
  command: TransitionCommand,
  actor: VisitActor,
): Promise<void> {
  await tx.appointmentEvent.create({
    data: {
      appointmentId: current.id,
      type: command.type,
      fromStatus: current.status,
      toStatus: toStatusOf(command),
      actorUserId: actor.userId,
      actorRole: eventRole(actor.role),
      reason: command.type === "CANCELLED" ? command.reason : null,
      fromStartsAt: command.type === "RESCHEDULED" ? current.startsAt : null,
      toStartsAt: command.type === "RESCHEDULED" ? command.startsAt : null,
    },
  });
}
