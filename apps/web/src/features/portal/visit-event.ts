import { portalName } from "@/shared/clinic-label";
import { formatWhen } from "@/shared/format";
import type { VisitEvent } from "@/shared/public-types";

const eventActions = [
  "CREATED",
  "CONFIRMED",
  "CANCELLED",
  "RESCHEDULED",
  "EXPIRED",
  "COMPLETED",
  "NO_SHOW",
] as const;

export type VisitEventAction = (typeof eventActions)[number];

export function asVisitEventAction(value: string): VisitEventAction | null {
  for (const action of eventActions) {
    if (action === value) return action;
  }
  return null;
}

export function eventActorLabel(event: VisitEvent, locale: string, roleLabel: (role: string) => string): string {
  if (event.actorRole === "SYSTEM") return roleLabel("eventActorSystem");
  if (!event.actorName) return roleLabel(event.actorRole);
  return portalName(event.actorName, locale);
}

/** One history line: when, action, optional new time, who, optional reason. */
export function formatVisitEvent(event: VisitEvent, locale: string, copy: { action: string; actor: string }): string {
  const parts = [formatWhen(event.createdAt, locale), copy.action];
  if (event.type === "RESCHEDULED" && event.fromStartsAt && event.toStartsAt) {
    parts.push(`${formatWhen(event.fromStartsAt, locale)} → ${formatWhen(event.toStartsAt, locale)}`);
  }
  parts.push(copy.actor);
  if (event.reason) parts.push(event.reason);
  return parts.join(" · ");
}
