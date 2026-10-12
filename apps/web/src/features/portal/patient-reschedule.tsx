"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatTime } from "@/shared/format";

type PatientRescheduleProps = {
  id: string;
  status: string;
  startsAt: string;
  doctorId: string;
  offeringId: string;
};

export function PatientReschedule(props: PatientRescheduleProps) {
  const movable = props.status === "REQUESTED" || props.status === "CONFIRMED";
  if (!movable || new Date(props.startsAt).getTime() <= Date.now()) return null;
  return <RescheduleForm id={props.id} doctorId={props.doctorId} offeringId={props.offeringId} />;
}

function RescheduleForm({ id, doctorId, offeringId }: { id: string; doctorId: string; offeringId: string }) {
  const t = useTranslations("desk");
  const [open, setOpen] = useState(false);

  return (
    <div className="grid justify-items-start gap-2">
      <button
        type="button"
        className="btn btn-secondary min-h-9 px-3.5 py-2 text-sm"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {t("reschedule")}
      </button>
      {open ? <MoveDay id={id} doctorId={doctorId} offeringId={offeringId} /> : null}
    </div>
  );
}

function MoveDay({ id, doctorId, offeringId }: { id: string; doctorId: string; offeringId: string }) {
  const t = useTranslations("desk");
  const common = useTranslations("common");
  const [slots, setSlots] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [failed, setFailed] = useState(false);

  return (
    <div className="grid w-full gap-3 rounded-[1rem] bg-white px-3.5 py-3.5">
      <label className="grid gap-1.5 text-sm text-muted">
        {t("pickDate")}
        <input
          className="field-control bg-sand scheme-light"
          type="date"
          min={todayYerevan()}
          onChange={(event) => void loadDay(event.target.value, doctorId, offeringId, setSlots, setNote, setFailed, t("noSlots"))}
        />
      </label>
      <SlotList slots={slots} onPick={(startsAt) => void moveVisit(id, startsAt, setNote, setFailed, common("failed"))} />
      {note ? <p className={failed ? "m-0 text-sm text-danger" : "m-0 text-sm text-muted"}>{note}</p> : null}
    </div>
  );
}

function SlotList({ slots, onPick }: { slots: string[]; onPick: (startsAt: string) => void }) {
  if (slots.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          className="cursor-pointer rounded-full border border-line bg-sand px-3 py-2 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/40 hover:text-accent"
          onClick={() => onPick(slot)}
        >
          {formatTime(slot)}
        </button>
      ))}
    </div>
  );
}

async function loadDay(
  date: string,
  doctorId: string,
  offeringId: string,
  setSlots: (slots: string[]) => void,
  setNote: (note: string) => void,
  setFailed: (failed: boolean) => void,
  emptyLabel: string,
): Promise<void> {
  if (!date) return;
  const params = new URLSearchParams({ doctorId, offeringId, date });
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/availability?${params}`);
  if (!response.ok) {
    setSlots([]);
    setFailed(true);
    setNote(emptyLabel);
    return;
  }
  const body = (await response.json()) as { data?: { startsAt?: string[] } };
  const next = body.data?.startsAt ?? [];
  setSlots(next);
  setFailed(next.length === 0);
  setNote(next.length === 0 ? emptyLabel : "");
}

async function moveVisit(
  id: string,
  startsAt: string,
  setNote: (note: string) => void,
  setFailed: (failed: boolean) => void,
  failedLabel: string,
): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments/${id}/reschedule`, {
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
  setNote(body?.error?.message || failedLabel);
}

function todayYerevan(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" }).format(new Date());
}
