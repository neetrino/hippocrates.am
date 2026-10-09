"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { asVisitStatus, formatTime } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import type { AppointmentCard } from "@/shared/public-types";

type BoardVisit = AppointmentCard & { when: string };

type VisitBoardProps = {
  visits: BoardVisit[];
};

export function ClinicVisitBoard({ visits }: VisitBoardProps) {
  const t = useTranslations("desk");
  const common = useTranslations("common");
  const services = useTranslations("services");
  if (visits.length === 0) return <p className="m-0 text-muted">{t("noVisits")}</p>;

  return (
    <div className="grid gap-3">
      {visits.map((item) => {
        const status = asVisitStatus(item.status);
        const open = item.status === "REQUESTED" || item.status === "CONFIRMED";
        return (
          <article className="grid gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5" key={item.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <strong>{item.patient.displayName}</strong>
                <p className="m-0 text-muted">
                  {item.when} · {localizedServiceName(item.offering.name, services)} · {status ? common(status) : item.status}
                </p>
              </div>
              <AppointmentActions id={item.id} status={item.status} startsAt={item.startsAt} mode="admin" />
            </div>
            {open ? <RescheduleVisit visit={item} /> : null}
          </article>
        );
      })}
    </div>
  );
}

function RescheduleVisit({ visit }: { visit: AppointmentCard }) {
  const t = useTranslations("desk");
  const common = useTranslations("common");
  const [slots, setSlots] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [failed, setFailed] = useState(false);

  async function loadSlots(date: string): Promise<void> {
    if (!date) return;
    const params = new URLSearchParams({ doctorId: visit.doctor.id, offeringId: visit.offering.id, date });
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/availability?${params}`);
    if (!response.ok) {
      setSlots([]);
      setFailed(true);
      setNote(t("noSlots"));
      return;
    }
    const body = (await response.json()) as { data?: { startsAt?: string[] } };
    const next = body.data?.startsAt ?? [];
    setSlots(next);
    setFailed(next.length === 0);
    setNote(next.length === 0 ? t("noSlots") : "");
  }

  async function move(startsAt: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/${visit.id}/reschedule`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ startsAt }),
    });
    if (response.ok) {
      window.location.reload();
      return;
    }
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    setFailed(true);
    setNote(body?.error?.message || common("failed"));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-sm font-semibold">
        {t("reschedule")}
        <input className="ml-2 rounded-xl border border-line bg-white px-3 py-2 font-normal" type="date" onChange={(event) => void loadSlots(event.target.value)} />
      </label>
      {slots.map((slot) => (
        <button className="cursor-pointer rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold" key={slot} type="button" onClick={() => void move(slot)}>
          {formatTime(slot)}
        </button>
      ))}
      {note ? <p className={failed ? "m-0 text-sm text-danger" : "m-0 text-sm text-muted"}>{note}</p> : null}
    </div>
  );
}
