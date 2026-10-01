"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { formatAmount, formatTime } from "@/shared/format";
import type { OfferingCard } from "@/shared/public-types";
import { cn } from "@/shared/ui/cn";

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

  if (!offering) return <p className="m-0 text-muted">{t("noService")}</p>;

  const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
  const controlClass =
    "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

  return (
    <div className="grid gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft">
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
              {item.name} · {common("price", { amount: formatAmount(item.priceAmd) })}
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
          <button
            key={slot}
            type="button"
            className={cn(
              "cursor-pointer rounded-full border border-line bg-white px-3 py-2",
              selected === slot && "border-accent bg-accent text-white",
            )}
            aria-pressed={selected === slot}
            onClick={() => setSelected(slot)}
          >
            {formatTime(slot)}
          </button>
        ))}
      </div>
      {message ? <p className="m-0 text-muted">{message}</p> : null}
      <button
        className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent disabled:cursor-not-allowed disabled:opacity-55"
        type="button"
        disabled={!selected || pending}
        onClick={() => void book()}
      >
        {t("book")}
      </button>
    </div>
  );
}
