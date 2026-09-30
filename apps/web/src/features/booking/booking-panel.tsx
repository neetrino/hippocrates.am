"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatAmd, formatTime } from "@/shared/format";
import type { OfferingCard } from "@/shared/public-types";

type SlotResponse = { data: { startsAt: string[] } };

function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" }).format(new Date());
}

export function BookingPanel({ offerings, initialSlots }: { offerings: OfferingCard[]; initialSlots: string[] }) {
  const [offeringId, setOfferingId] = useState(offerings[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState(initialSlots);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState(initialSlots.length === 0 ? "Այդ օրը ազատ ժամ չկա" : "");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const offering = offerings.find((item) => item.id === offeringId);

  async function loadSlots(nextOfferingId: string, nextDate: string): Promise<void> {
    const next = offerings.find((item) => item.id === nextOfferingId);
    if (!next || !nextDate) return;
    const params = new URLSearchParams({ doctorId: next.doctorId, offeringId: next.id, date: nextDate });
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/availability?${params}`);
    if (!response.ok) {
      setMessage("Ազատ ժամերը չբեռնվեցին");
      return;
    }
    const body = (await response.json()) as SlotResponse;
    setSelected("");
    setSlots(body.data.startsAt);
    setMessage(body.data.startsAt.length === 0 ? "Այդ օրը ազատ ժամ չկա" : "");
  }

  async function book(): Promise<void> {
    if (!offering || !selected) return;
    setPending(true);
    setMessage("");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/appointments`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ offeringId: offering.id, startsAt: selected }),
    });
    setPending(false);
    if (response.status === 401 || response.status === 403) {
      setMessage("Ամրագրելու համար մուտք գործեք որպես պացիենտ");
      return;
    }
    if (!response.ok) {
      setMessage("Այդ ժամը ազատ չէ");
      return;
    }
    router.push("/me");
    router.refresh();
  }

  if (!offering) return <p className="muted">Ծառայություն դեռ չկա։</p>;

  return (
    <div className="panel stack">
      <h2>Ամրագրել այց</h2>
      <label className="field">
        Ծառայություն
        <select
          value={offeringId}
          onChange={(event) => {
            setOfferingId(event.target.value);
            void loadSlots(event.target.value, date);
          }}
        >
          {offerings.map((item) => (
            <option key={item.id} value={item.id}>
              {item.doctor ? `${item.doctor.user.displayName} · ` : ""}
              {item.name} · {formatAmd(item.priceAmd)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Օր
        <input
          type="date"
          value={date}
          min={todayIso()}
          onChange={(event) => {
            setDate(event.target.value);
            void loadSlots(offeringId, event.target.value);
          }}
        />
      </label>
      <div className="slots">
        {slots.map((slot) => (
          <button key={slot} type="button" className="slot" aria-pressed={selected === slot} onClick={() => setSelected(slot)}>
            {formatTime(slot)}
          </button>
        ))}
      </div>
      {message ? <p className="muted">{message}</p> : null}
      <button className="btn" type="button" disabled={!selected || pending} onClick={() => void book()}>
        Գրանցել
      </button>
    </div>
  );
}
