"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { formatAmount, formatTime } from "@/shared/format";
import type { OfferingCard } from "@/shared/public-types";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";
import styles from "@/features/booking/booking-panel.module.css";

type SlotResponse = { data: { startsAt: string[] } };

function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" }).format(new Date());
}

export function BookingPanel({ offerings, initialSlots }: { offerings: OfferingCard[]; initialSlots: string[] }) {
  const t = useTranslations("booking");
  const common = useTranslations("common");
  const [offeringId, setOfferingId] = useState(offerings[0]?.id ?? "");
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState(initialSlots);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState(initialSlots.length === 0 ? t("noSlots") : "");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const offering = offerings.find((item) => item.id === offeringId);

  async function loadSlots(nextOfferingId: string, nextDate: string): Promise<void> {
    const next = offerings.find((item) => item.id === nextOfferingId);
    if (!next || !nextDate) return;
    const params = new URLSearchParams({ doctorId: next.doctorId, offeringId: next.id, date: nextDate });
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/availability?${params}`);
    if (!response.ok) {
      setMessage(t("slotsFailed"));
      return;
    }
    const body = (await response.json()) as SlotResponse;
    setSelected("");
    setSlots(body.data.startsAt);
    setMessage(body.data.startsAt.length === 0 ? t("noSlots") : "");
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
      setMessage(t("signIn"));
      return;
    }
    if (!response.ok) {
      setMessage(t("taken"));
      return;
    }
    router.push("/me");
    router.refresh();
  }

  if (!offering) return <p className={ui.muted}>{t("noService")}</p>;

  return (
    <div className={cx(ui.panel, ui.stack)}>
      <h2>{t("title")}</h2>
      <label className={ui.field}>
        {t("service")}
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
              {item.name} · {common("price", { amount: formatAmount(item.priceAmd) })}
            </option>
          ))}
        </select>
      </label>
      <label className={ui.field}>
        {t("day")}
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
      <div className={styles.slots}>
        {slots.map((slot) => (
          <button key={slot} type="button" className={styles.slot} aria-pressed={selected === slot} onClick={() => setSelected(slot)}>
            {formatTime(slot)}
          </button>
        ))}
      </div>
      {message ? <p className={ui.muted}>{message}</p> : null}
      <button className={ui.btn} type="button" disabled={!selected || pending} onClick={() => void book()}>
        {t("book")}
      </button>
    </div>
  );
}
