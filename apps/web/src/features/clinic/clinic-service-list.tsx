"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { clinicSend } from "@/features/clinic/clinic-api";
import { formatAmount } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";

export type ClinicOffering = {
  id: string;
  name: string;
  priceAmd: number;
  durationMinutes: number;
  isEstimate: boolean;
  doctor: { user: { displayName: string } };
};

const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
const controlClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

export function ClinicServiceList({ clinicId, offerings }: { clinicId: string; offerings: ClinicOffering[] }) {
  return (
    <div className="grid gap-3">
      {offerings.map((item) => (
        <ServiceCard clinicId={clinicId} item={item} key={item.id} />
      ))}
    </div>
  );
}

function ServiceCard({ clinicId, item }: { clinicId: string; item: ClinicOffering }) {
  const t = useTranslations("desk");
  const common = useTranslations("common");
  const services = useTranslations("services");
  const [open, setOpen] = useState(false);
  const price = common("price", { amount: formatAmount(item.priceAmd) });
  return (
    <article className="rounded-[14px] border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <span>
          <span className="font-semibold">{localizedServiceName(item.name, services)}</span>
          <span className="mt-1 block text-sm text-muted">{item.doctor.user.displayName}</span>
        </span>
        <span className="flex items-center gap-3">
          <span>
            {price} · {common("minutes", { count: item.durationMinutes })}
            {item.isEstimate ? ` · ${common("estimate")}` : ""}
          </span>
          <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => setOpen((value) => !value)}>{t("edit")}</button>
        </span>
      </div>
      {open ? <ServiceForm clinicId={clinicId} item={item} /> : null}
    </article>
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
    });
    if (ok) window.location.reload();
    else setMessage(t("saveFailed"));
  }

  return (
    <form className="grid gap-3.5 border-t border-line px-4 py-4" onSubmit={(event) => void onSubmit(event)}>
      <label className={fieldClass}>{common("name")}<input name="name" required maxLength={120} defaultValue={item.name} className={controlClass} /></label>
      <label className={fieldClass}>{t("amd")}<input name="priceAmd" type="number" min={0} required defaultValue={item.priceAmd} className={controlClass} /></label>
      <label className={fieldClass}>{t("duration")}<input name="durationMinutes" type="number" min={5} required defaultValue={item.durationMinutes} className={controlClass} /></label>
      <label className="flex items-center gap-2 text-[0.92rem] font-semibold">
        <input name="isEstimate" type="checkbox" defaultChecked={item.isEstimate} />
        {common("estimate")}
      </label>
      <button className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white" type="submit">{t("save")}</button>
      {message ? <p className="m-0 text-danger">{message}</p> : null}
    </form>
  );
}
