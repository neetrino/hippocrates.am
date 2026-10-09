"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { clinicSend } from "@/features/clinic/clinic-api";

export type ClinicBranch = { id: string; name: string; address: string };

const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
const controlClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

export function ClinicBranches({
  clinicId,
  branches,
  clinicAddress,
  localeAddress,
}: {
  clinicId: string;
  branches: ClinicBranch[];
  clinicAddress: string;
  localeAddress: string;
}) {
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
          <BranchCard
            key={branch.id}
            clinicId={clinicId}
            branch={branch}
            clinicAddress={clinicAddress}
            localeAddress={localeAddress}
          />
        ))}
      </div>
      <form className="grid max-w-xl gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft" onSubmit={(event) => void onSubmit(event)}>
        <label className={fieldClass}>{t("branchName")}<input name="name" required maxLength={80} className={controlClass} /></label>
        <label className={fieldClass}>{platform("address")}<input name="address" maxLength={160} className={controlClass} /></label>
        <button className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white" type="submit">{t("add")}</button>
        {message ? <p className="m-0 text-danger">{message}</p> : null}
      </form>
    </section>
  );
}

function BranchCard({
  clinicId,
  branch,
  clinicAddress,
  localeAddress,
}: {
  clinicId: string;
  branch: ClinicBranch;
  clinicAddress: string;
  localeAddress: string;
}) {
  const t = useTranslations("desk");
  const clinicPage = useTranslations("clinicPage");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const title = branch.name === "Հիմնական" && locale !== "hy" ? clinicPage("mainBranch") : branch.name;
  const shownAddress = branch.address === clinicAddress && localeAddress.trim() ? localeAddress : branch.address;

  async function remove(): Promise<void> {
    const ok = await clinicSend(`/clinics/${clinicId}/branches/${branch.id}`, "DELETE");
    if (ok) window.location.reload();
    else setMessage(t("saveFailed"));
  }

  return (
    <article className="rounded-[14px] border border-line bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-muted">{shownAddress}</span>
        <span className="flex gap-3">
          <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => setOpen((value) => !value)}>{t("edit")}</button>
          <button className="cursor-pointer text-sm font-semibold text-danger" type="button" onClick={() => void remove()}>{t("remove")}</button>
        </span>
      </div>
      {open ? (
        <BranchForm
          clinicId={clinicId}
          branch={branch}
          shownName={title}
          shownAddress={shownAddress}
        />
      ) : null}
      {message ? <p className="m-0 px-4 pb-3 text-sm text-danger">{message}</p> : null}
    </article>
  );
}

function BranchForm({
  clinicId,
  branch,
  shownName,
  shownAddress,
}: {
  clinicId: string;
  branch: ClinicBranch;
  shownName: string;
  shownAddress: string;
}) {
  const t = useTranslations("desk");
  const platform = useTranslations("platform");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await clinicSend(`/clinics/${clinicId}/branches/${branch.id}`, "PATCH", {
      name: storedValue(String(form.get("name") ?? ""), shownName, branch.name),
      address: storedValue(String(form.get("address") ?? ""), shownAddress, branch.address),
    });
    if (ok) window.location.reload();
    else setMessage(t("saveFailed"));
  }

  return (
    <form className="grid gap-3.5 border-t border-line px-4 py-4" onSubmit={(event) => void onSubmit(event)}>
      <label className={fieldClass}>{t("branchName")}<input name="name" required maxLength={80} defaultValue={shownName} className={controlClass} /></label>
      <label className={fieldClass}>{platform("address")}<input name="address" maxLength={160} defaultValue={shownAddress} className={controlClass} /></label>
      <button className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white" type="submit">{t("save")}</button>
      {message ? <p className="m-0 text-danger">{message}</p> : null}
    </form>
  );
}

function storedValue(typed: string, shown: string, stored: string): string {
  return typed.trim() === shown.trim() ? stored : typed.trim();
}
