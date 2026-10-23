"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PhoneField } from "@/features/auth/phone-field";
import { portalName } from "@/shared/clinic-label";
import { formatTime } from "@/shared/format";
import { sanitizeNameInput } from "@/shared/input-constraints";
import { localizedServiceName, type ServiceMessageKey } from "@/shared/service-name";

export type DeskDoctor = {
  id: string;
  published?: boolean;
  user: { displayName: string };
  locales?: { locale: string; name: string }[];
};
export type DeskService = {
  id: string;
  name: string;
  published?: boolean;
  doctor: { id?: string; published?: boolean };
};

const control =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

export function DeskBooking({
  clinicId,
  doctors,
  offerings,
}: {
  clinicId: string;
  doctors: DeskDoctor[];
  offerings: DeskService[];
}) {
  const t = useTranslations("desk");
  const [open, setOpen] = useState(false);
  const bookable = doctors.filter((doctor) => doctor.published !== false);
  if (bookable.length === 0) return null;

  return (
    <section className="grid gap-3">
      <button className="btn btn-primary min-h-10 w-fit px-4" type="button" onClick={() => setOpen((value) => !value)}>
        {t("book")}
      </button>
      {open ? <DeskForm clinicId={clinicId} doctors={bookable} offerings={offerings} /> : null}
    </section>
  );
}

function DeskForm({ clinicId, doctors, offerings }: { clinicId: string; doctors: DeskDoctor[]; offerings: DeskService[] }) {
  const t = useTranslations("desk");
  const services = useTranslations("services");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const choices = offerings.filter((item) => item.doctor.id === doctorId && item.published !== false && item.doctor.published !== false);
  const [offeringId, setOfferingId] = useState(choices[0]?.id ?? "");
  const activeOffering = choices.some((item) => item.id === offeringId) ? offeringId : (choices[0]?.id ?? "");
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [note, setNote] = useState("");

  function clearSlots(): void {
    setSlots([]);
    setSlot("");
    setNote("");
  }

  return (
    <form
      className="grid gap-3 rounded-[1.1rem] border border-line bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void saveDeskVisit({ clinicId, offeringId: activeOffering, startsAt: slot, name, phone, setNote, failed: t("bookFailed") });
      }}
    >
      <VisitChoices
        doctors={doctors}
        doctorId={doctorId}
        choices={choices}
        offeringId={activeOffering}
        services={services}
        onDoctor={(id) => {
          setDoctorId(id);
          clearSlots();
        }}
        onOffering={(id) => {
          setOfferingId(id);
          clearSlots();
        }}
        onDate={(date) => void loadDay(date, doctorId, activeOffering, setSlots, setSlot, setNote, t("noSlots"))}
        resetKey={`${doctorId}-${activeOffering}`}
      />
      <SlotChoices slots={slots} slot={slot} onPick={setSlot} />
      <PersonFields name={name} note={note} onName={setName} onPhone={setPhone} />
    </form>
  );
}

function PersonFields({
  name,
  note,
  onName,
  onPhone,
}: {
  name: string;
  note: string;
  onName: (name: string) => void;
  onPhone: (phone: string | null) => void;
}) {
  const t = useTranslations("desk");
  return (
    <>
      <label className="grid gap-1.5 text-sm font-semibold">
        {t("patientName")}
        <input className={control} value={name} required maxLength={80} onChange={(event) => onName(sanitizeNameInput(event.target.value))} />
      </label>
      <PhoneField label={t("phone")} onChange={onPhone} />
      {note ? <p className={`m-0 text-sm ${note === t("noSlots") ? "text-muted" : "text-danger"}`}>{note}</p> : null}
      <button className="btn btn-primary min-h-10 w-fit px-4" type="submit">
        {t("book")}
      </button>
    </>
  );
}

type VisitChoiceProps = {
  doctors: DeskDoctor[];
  doctorId: string;
  choices: DeskService[];
  offeringId: string;
  services: (key: ServiceMessageKey) => string;
  onDoctor: (id: string) => void;
  onOffering: (id: string) => void;
  onDate: (date: string) => void;
  resetKey: string;
};

function VisitChoices({ doctors, doctorId, choices, offeringId, services, onDoctor, onOffering, onDate, resetKey }: VisitChoiceProps) {
  const locale = useLocale();
  const t = useTranslations("desk");
  return (
    <>
      <label className="grid gap-1.5 text-sm font-semibold">
        {t("doctor")}
        <select className={control} value={doctorId} onChange={(event) => onDoctor(event.target.value)}>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {portalName(doctor.user.displayName, locale, doctor.locales)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-semibold">
        {t("service")}
        <select className={control} value={offeringId} onChange={(event) => onOffering(event.target.value)}>
          {choices.map((item) => (
            <option key={item.id} value={item.id}>
              {localizedServiceName(item.name, services)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-semibold">
        {t("date")}
        <input key={resetKey} className={control} type="date" onChange={(event) => onDate(event.target.value)} />
      </label>
    </>
  );
}

async function loadDay(
  date: string,
  doctorId: string,
  offeringId: string,
  setSlots: (slots: string[]) => void,
  setSlot: (slot: string) => void,
  setNote: (note: string) => void,
  empty: string,
): Promise<void> {
  setSlot("");
  setSlots([]);
  if (!date || !offeringId) return;
  const params = new URLSearchParams({ doctorId, offeringId, date });
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/availability?${params}`);
  const body = (await response.json().catch(() => null)) as { data?: { startsAt?: string[] } } | null;
  const next = response.ok ? (body?.data?.startsAt ?? []) : [];
  setSlots(next);
  setNote(next.length === 0 ? empty : "");
}

function SlotChoices({ slots, slot, onPick }: { slots: string[]; slot: string; onPick: (slot: string) => void }) {
  if (slots.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((item) => (
        <button
          className={`cursor-pointer rounded-full border px-3 py-2 text-sm font-semibold ${item === slot ? "border-accent bg-accent text-white" : "border-line bg-white"}`}
          key={item}
          type="button"
          onClick={() => onPick(item)}
        >
          {formatTime(item)}
        </button>
      ))}
    </div>
  );
}

async function saveDeskVisit(input: {
  clinicId: string;
  offeringId: string;
  startsAt: string;
  name: string;
  phone: string | null;
  setNote: (note: string) => void;
  failed: string;
}): Promise<void> {
  if (!input.offeringId || !input.startsAt || !input.phone) {
    input.setNote(input.failed);
    return;
  }
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clinics/${input.clinicId}/visits`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ offeringId: input.offeringId, startsAt: input.startsAt, name: input.name, phone: input.phone }),
  });
  if (response.ok) {
    window.location.reload();
    return;
  }
  input.setNote(input.failed);
}
