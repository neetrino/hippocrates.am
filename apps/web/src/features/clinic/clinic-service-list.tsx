"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { clinicSend } from "@/features/clinic/clinic-api";
import { PatientAvatar } from "@/features/portal/patient-avatar";
import { formatAmount } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";

export type ClinicOffering = {
  id: string;
  name: string;
  priceAmd: number;
  durationMinutes: number;
  isEstimate: boolean;
  published?: boolean;
  doctor: { id?: string; published?: boolean; user: { displayName: string } };
};

export type ServiceDoctor = {
  id: string;
  specialty: string;
  published?: boolean;
  photoUrl: string | null;
  user: { displayName: string };
};

const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
const controlClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

export function DoctorServiceGroup({
  clinicId,
  doctor,
  offerings,
  onAdd,
}: {
  clinicId: string;
  doctor: ServiceDoctor;
  offerings: ClinicOffering[];
  onAdd: () => void;
}) {
  const t = useTranslations("desk");
  return (
    <article className="rounded-card border border-line bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <span className="flex min-w-0 items-center gap-3">
          <PatientAvatar name={doctor.user.displayName} photoUrl={doctor.photoUrl} />
          <span className="grid min-w-0">
            <span className="font-semibold">{doctor.user.displayName}</span>
            <span className="text-sm text-muted">{doctor.specialty}</span>
            {doctor.published === false ? <span className="text-sm text-muted">{t("doctorHidden")}</span> : null}
          </span>
        </span>
        <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={onAdd}>
          {t("addForDoctor")}
        </button>
      </div>
      <div className="grid gap-px border-t border-line bg-line">
        {offerings.length === 0 ? (
          <p className="m-0 bg-white px-5 py-4 text-sm text-muted">{t("emptyServices")}</p>
        ) : (
          offerings.map((item) => <ServiceCard clinicId={clinicId} item={item} key={item.id} />)
        )}
      </div>
    </article>
  );
}

function ServiceCard({ clinicId, item }: { clinicId: string; item: ClinicOffering }) {
  const t = useTranslations("desk");
  const common = useTranslations("common");
  const services = useTranslations("services");
  const [open, setOpen] = useState(false);
  const live = item.published !== false;
  return (
    <div className="bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <span className="grid min-w-0 gap-1">
          <span className="font-semibold">{localizedServiceName(item.name, services)}</span>
          <span className="text-sm text-muted">
            {common("price", { amount: formatAmount(item.priceAmd) })} · {common("minutes", { count: item.durationMinutes })}
            {item.isEstimate ? ` · ${common("estimate")}` : ""}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span className={live ? "rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white" : "rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-muted"}>
            {live ? t("published") : t("hidden")}
          </span>
          <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => setOpen((value) => !value)}>
            {t("edit")}
          </button>
        </span>
      </div>
      {open ? <ServiceForm clinicId={clinicId} item={item} /> : null}
    </div>
  );
}

function ServiceForm({ clinicId, item }: { clinicId: string; item: ClinicOffering }) {
  const t = useTranslations("desk");
  const common = useTranslations("common");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await clinicSend(`/clinics/${clinicId}/offerings/${item.id}`, "PATCH", {
      name: String(form.get("name") ?? ""),
      priceAmd: Number(form.get("priceAmd")),
      durationMinutes: Number(form.get("durationMinutes")),
      isEstimate: form.get("isEstimate") === "on",
      published: form.get("published") === "on",
    });
    if (ok) window.location.reload();
    else setMessage(t("saveFailed"));
  }

  return (
    <form className="grid gap-3.5 border-t border-line px-5 py-4" onSubmit={(event) => void onSubmit(event)}>
      <label className={fieldClass}>{common("name")}<input name="name" required maxLength={120} defaultValue={item.name} className={controlClass} /></label>
      <label className={fieldClass}>{t("amd")}<input name="priceAmd" type="number" min={0} required defaultValue={item.priceAmd} className={controlClass} /></label>
      <label className={fieldClass}>{t("duration")}<input name="durationMinutes" type="number" min={5} required defaultValue={item.durationMinutes} className={controlClass} /></label>
      <label className="flex items-center gap-2 text-[0.92rem] font-semibold">
        <input name="isEstimate" type="checkbox" defaultChecked={item.isEstimate} />
        {common("estimate")}
      </label>
      <label className="flex items-center gap-2 text-[0.92rem] font-semibold">
        <input name="published" type="checkbox" defaultChecked={item.published !== false} />
        {t("published")}
      </label>
      <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
      {message ? <p className="m-0 text-danger">{message}</p> : null}
    </form>
  );
}
