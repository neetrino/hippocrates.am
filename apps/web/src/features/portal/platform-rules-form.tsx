"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export type PlatformRules = {
  patientRegistrationEnabled: boolean;
  bookingEnabled: boolean;
  maxBookingDays: number;
  minNoticeMinutes: number;
  cancelDeadlineMinutes: number;
  rescheduleDeadlineMinutes: number;
};

export function PlatformRulesForm({ initial }: { initial: PlatformRules }) {
  const t = useTranslations("platformRules");
  const [rules, setRules] = useState(initial);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  async function save(): Promise<void> {
    setPending(true);
    setMessage("");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/platform/settings`, {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(rules),
    });
    setPending(false);
    setFailed(!response.ok);
    setMessage(response.ok ? t("saved") : t("failed"));
  }

  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <RuleFields rules={rules} onChange={setRules} />
      {message ? <p className={failed ? "m-0 text-sm text-danger" : "m-0 text-sm text-accent"}>{message}</p> : null}
      <button className="btn btn-primary w-fit" type="submit" disabled={pending}>
        {t("save")}
      </button>
    </form>
  );
}

function RuleFields({ rules, onChange }: { rules: PlatformRules; onChange: (rules: PlatformRules) => void }) {
  const t = useTranslations("platformRules");
  return (
    <>
      <p className="m-0 text-sm leading-relaxed text-muted">{t("lede")}</p>
      <Toggle
        label={t("registration")}
        checked={rules.patientRegistrationEnabled}
        onChange={(patientRegistrationEnabled) => onChange({ ...rules, patientRegistrationEnabled })}
      />
      <Toggle
        label={t("booking")}
        checked={rules.bookingEnabled}
        onChange={(bookingEnabled) => onChange({ ...rules, bookingEnabled })}
      />
      <HourFields rules={rules} onChange={onChange} />
    </>
  );
}

const maxHours = 168;

function HourFields({ rules, onChange }: { rules: PlatformRules; onChange: (rules: PlatformRules) => void }) {
  const t = useTranslations("platformRules");
  return (
    <>
      <NumberField label={t("maxDays")} value={rules.maxBookingDays} min={1} max={180} onChange={(maxBookingDays) => onChange({ ...rules, maxBookingDays })} />
      <NumberField label={t("minNotice")} value={hoursOf(rules.minNoticeMinutes)} min={0} max={maxHours} onChange={(hours) => onChange({ ...rules, minNoticeMinutes: hours * 60 })} />
      <NumberField label={t("cancelDeadline")} value={hoursOf(rules.cancelDeadlineMinutes)} min={0} max={maxHours} onChange={(hours) => onChange({ ...rules, cancelDeadlineMinutes: hours * 60 })} />
      <NumberField label={t("rescheduleDeadline")} value={hoursOf(rules.rescheduleDeadlineMinutes)} min={0} max={maxHours} onChange={(hours) => onChange({ ...rules, rescheduleDeadlineMinutes: hours * 60 })} />
    </>
  );
}

function hoursOf(minutes: number): number {
  return minutes / 60;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <input
        type="checkbox"
        className="size-4 accent-accent"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field-label">
      {label}
      <input
        className="field-control"
        type="number"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isInteger(next)) onChange(next);
        }}
      />
    </label>
  );
}
