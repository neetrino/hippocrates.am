"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

export type ClinicBranch = { id: string; name: string; address: string };

const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
const controlClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

export function ClinicBranches({ clinicId, branches }: { clinicId: string; branches: ClinicBranch[] }) {
  const t = useTranslations("desk");
  const platform = useTranslations("platform");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clinics/${clinicId}/branches`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        address: String(form.get("address") ?? ""),
      }),
    });
    if (response.ok) window.location.reload();
    else setMessage(t("saveFailed"));
  }

  return (
    <section className="grid gap-3">
      <h2>{t("newBranch")}</h2>
      <div className="grid gap-3">
        {branches.map((branch) => (
          <p className="m-0 flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5" key={branch.id}>
            <span className="font-semibold">{branch.name}</span>
            <span className="text-sm text-muted">{branch.address}</span>
          </p>
        ))}
      </div>
      <form className="grid max-w-xl gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft" onSubmit={(event) => void onSubmit(event)}>
        <label className={fieldClass}>{t("branchName")}<input name="name" required className={controlClass} /></label>
        <label className={fieldClass}>{platform("address")}<input name="address" className={controlClass} /></label>
        <button className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white" type="submit">{t("add")}</button>
        {message ? <p className="m-0 text-danger">{message}</p> : null}
      </form>
    </section>
  );
}
