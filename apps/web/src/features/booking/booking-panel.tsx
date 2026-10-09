"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TimeSlot } from "@/features/booking/initial-slots";
import { localizedServiceName } from "@/shared/service-name";
import { formatAmount, formatTime } from "@/shared/format";
import type { OfferingCard } from "@/shared/public-types";
import { cn } from "@/shared/ui/cn";

type SlotResponse = { data: { startsAt: string[]; slots?: TimeSlot[] } };
type Tone = "muted" | "success" | "danger";

function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" }).format(new Date());
}

function slotsFrom(body: SlotResponse): TimeSlot[] {
  if (body.data.slots) return body.data.slots;
  return body.data.startsAt.map((startsAt) => ({ startsAt, busy: false }));
}

export function BookingPanel({ offerings, initialSlots }: { offerings: OfferingCard[]; initialSlots: TimeSlot[] }) {
  const t = useTranslations("booking");
  const common = useTranslations("common");
  const services = useTranslations("services");
  const [offeringId, setOfferingId] = useState(offerings[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState(initialSlots);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState(initialSlots.length === 0 ? t("noSlots") : "");
  const [tone, setTone] = useState<Tone>("muted");
  const [pending, setPending] = useState(false);
  const offering = offerings.find((item) => item.id === offeringId);

  async function loadSlots(nextOfferingId: string, nextDate: string): Promise<TimeSlot[]> {
    const next = offerings.find((item) => item.id === nextOfferingId);
    if (!next || !nextDate) return [];
    const params = new URLSearchParams({ doctorId: next.doctorId, offeringId: next.id, date: nextDate });
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/availability?${params}`);
    if (!response.ok) {
      setTone("danger");
      setMessage(t("slotsFailed"));
      return [];
    }
    const body = (await response.json()) as SlotResponse;
    const nextSlots = slotsFrom(body);
    setSelected("");
    setSlots(nextSlots);
    setTone("muted");
    setMessage(nextSlots.length === 0 ? t("noSlots") : "");
    return nextSlots;
  }

  async function book(): Promise<void> {
    if (!offering || !selected) return;
    setPending(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ offeringId: offering.id, startsAt: selected }),
    });
    setPending(false);
    if (response.status === 401 || response.status === 403) {
      setTone("danger");
      setMessage(t("signIn"));
      return;
    }
    if (!response.ok) {
      await loadSlots(offering.id, date);
      setTone("danger");
      setMessage(t("taken"));
      return;
    }
    await loadSlots(offering.id, date);
    setTone("success");
    setMessage(t("booked"));
  }

  if (!offering) return <p className="m-0 text-muted">{t("noService")}</p>;

  const fieldClass = "field-label";
  const controlClass = "field-control";

  return (
    <div className="grid min-w-0 gap-4 overflow-hidden rounded-card bg-surface p-6 shadow-soft max-md:p-5">
      <h2>{t("title")}</h2>
      <label className={fieldClass}>
        {t("service")}
        <select
          className={controlClass}
          value={offeringId}
          onChange={(event) => {
            setOfferingId(event.target.value);
            void loadSlots(event.target.value, date);
          }}
        >
          {offerings.map((item) => (
            <option key={item.id} value={item.id}>
              {item.doctor ? `${item.doctor.user.displayName} · ` : ""}
              {localizedServiceName(item.name, services)} · {common("price", { amount: formatAmount(item.priceAmd) })}
            </option>
          ))}
        </select>
      </label>
      <label className={fieldClass}>
        {t("day")}
        <input
          className={controlClass}
          type="date"
          value={date}
          min={todayIso()}
          onChange={(event) => {
            setDate(event.target.value);
            void loadSlots(offeringId, event.target.value);
          }}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <TimeButton
            key={slot.startsAt}
            slot={slot}
            selected={selected === slot.startsAt}
            busyLabel={t("busy")}
            onSelect={(startsAt) => {
              setSelected(startsAt);
              setTone("muted");
              setMessage("");
            }}
          />
        ))}
      </div>
      {message ? (
        <p className={cn("m-0", tone === "success" && "text-accent", tone === "danger" && "text-danger", tone === "muted" && "text-muted")}>
          {message}
        </p>
      ) : null}
      <button
        className="btn btn-primary w-full"
        type="button"
        disabled={!selected || pending}
        onClick={() => void book()}
      >
        {t("book")}
      </button>
    </div>
  );
}

function TimeButton({
  slot,
  selected,
  busyLabel,
  onSelect,
}: {
  slot: TimeSlot;
  selected: boolean;
  busyLabel: string;
  onSelect: (startsAt: string) => void;
}) {
  const time = formatTime(slot.startsAt);
  return (
    <button
      type="button"
      disabled={slot.busy}
      aria-pressed={!slot.busy && selected}
      aria-label={slot.busy ? `${time}, ${busyLabel}` : time}
      className={cn(
        "inline-flex h-10 w-[4.75rem] shrink-0 items-center justify-center rounded-full border text-sm tabular-nums disabled:opacity-100",
        slot.busy && "cursor-not-allowed border-danger/35 bg-danger/10 text-danger line-through",
        !slot.busy && selected && "border-accent bg-accent text-white",
        !slot.busy && !selected && "cursor-pointer border-line bg-surface text-ink hover:border-accent/40",
      )}
      onClick={() => onSelect(slot.startsAt)}
    >
      {time}
    </button>
  );
}
