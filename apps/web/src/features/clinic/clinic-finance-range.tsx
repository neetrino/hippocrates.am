"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const controlClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

export function ClinicFinanceRange({ from, to }: { from: string; to: string }) {
  const t = useTranslations("desk");
  const router = useRouter();
  const [invalid, setInvalid] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextFrom = String(form.get("from") ?? "");
    const nextTo = String(form.get("to") ?? "");
    if ((nextFrom && !nextTo) || (!nextFrom && nextTo) || (nextFrom && nextTo && nextFrom > nextTo)) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    router.push(nextFrom && nextTo ? `/clinic/finance?from=${nextFrom}&to=${nextTo}` : "/clinic/finance");
  }

  return (
    <form className="flex flex-wrap items-end gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1.5 text-sm font-semibold">
        {t("fromDate")}
        <input className={controlClass} name="from" type="date" defaultValue={from} />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold">
        {t("toDate")}
        <input className={controlClass} name="to" type="date" defaultValue={to} />
      </label>
      <button className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white" type="submit">{t("applyRange")}</button>
      {from || to ? <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => router.push("/clinic/finance")}>{t("allDates")}</button> : null}
      {invalid ? <p className="m-0 w-full text-sm text-danger">{t("rangeInvalid")}</p> : null}
    </form>
  );
}
