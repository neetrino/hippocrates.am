"use client";

import { useLocale, useTranslations } from "next-intl";
import { asVisitEventAction, eventActorLabel, formatVisitEvent } from "@/features/portal/visit-event";
import type { VisitEvent } from "@/shared/public-types";

const actionKey = {
  CREATED: "eventCreated",
  CONFIRMED: "eventConfirmed",
  CANCELLED: "eventCancelled",
  RESCHEDULED: "eventRescheduled",
  EXPIRED: "eventExpired",
  COMPLETED: "eventCompleted",
  NO_SHOW: "eventNoShow",
} as const;

export function VisitHistory({ events }: { events?: VisitEvent[] | null }) {
  const locale = useLocale();
  const t = useTranslations("common");
  if (!events?.length) return null;
  return (
    <ol className="m-0 grid list-none gap-1 p-0" aria-label={t("eventHistory")}>
      {events.map((event) => (
        <li key={event.id} className="m-0 text-sm text-muted">
          {formatVisitEvent(event, locale, {
            action: actionLabel(event.type, t),
            actor: eventActorLabel(event, (role) => actorFallback(role, t)),
          })}
        </li>
      ))}
    </ol>
  );
}

function actionLabel(type: string, t: (key: (typeof actionKey)[keyof typeof actionKey]) => string): string {
  const action = asVisitEventAction(type);
  return action ? t(actionKey[action]) : type;
}

function actorFallback(role: string, t: (key: "eventActorSystem" | "PATIENT" | "DOCTOR" | "ADMIN") => string): string {
  if (role === "SYSTEM" || role === "eventActorSystem") return t("eventActorSystem");
  if (role === "PATIENT" || role === "DOCTOR" || role === "ADMIN") return t(role);
  return role;
}
