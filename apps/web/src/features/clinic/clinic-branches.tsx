"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { clinicSend } from "@/features/clinic/clinic-api";
import { EmptyState } from "@/shared/ui/empty-state";

export type ClinicBranch = { id: string; name: string; address: string };
export const MAIN_BRANCH_NAME = "Հիմնական";

const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";

export function extraBranches(branches: ClinicBranch[]): ClinicBranch[] {
  return branches.filter((branch) => branch.name !== MAIN_BRANCH_NAME);
}

export function BranchCreateForm({ clinicId, onClose }: { clinicId: string; onClose: () => void }) {
  const t = useTranslations("desk");
  const platform = useTranslations("platform");
  const common = useTranslations("common");
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
    <form className="grid gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft" onSubmit={(event) => void onSubmit(event)}>
      <h2 className="m-0">{t("newBranch")}</h2>
      <label className={fieldClass}>
        {t("branchName")}
        <input name="name" required maxLength={80} className="field-control" />
      </label>
      <label className={fieldClass}>
        {platform("address")}
        <input name="address" maxLength={160} className="field-control" />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary w-fit" type="submit">{t("addBranch")}</button>
        <button className="btn btn-secondary w-fit" type="button" onClick={onClose}>{common("cancel")}</button>
      </div>
      {message ? <p className="m-0 text-danger">{message}</p> : null}
    </form>
  );
}

export function ClinicBranchList({
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
  const extras = extraBranches(branches);
  return (
    <section className="grid gap-3">
      <h2 className="m-0">{t("branches")}</h2>
      {extras.length === 0 ? <EmptyState>{t("emptyBranches")}</EmptyState> : null}
      {extras.map((branch) => (
        <BranchCard
          key={branch.id}
          clinicId={clinicId}
          branch={branch}
          clinicAddress={clinicAddress}
          localeAddress={localeAddress}
        />
      ))}
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
  const [open, setOpen] = useState(false);
  const shownAddress = branch.address === clinicAddress && localeAddress.trim() ? localeAddress : branch.address;
  return (
    <article className="rounded-card border border-line bg-white shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <span className="grid min-w-0">
          <span className="font-semibold">{branch.name}</span>
          {shownAddress ? <span className="text-sm text-muted">{shownAddress}</span> : null}
        </span>
        <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => setOpen((value) => !value)}>
          {t("edit")}
        </button>
      </div>
      {open ? (
        <BranchForm
          clinicId={clinicId}
          branch={branch}
          shownName={branch.name}
          shownAddress={shownAddress}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </article>
  );
}

function BranchForm({
  clinicId,
  branch,
  shownName,
  shownAddress,
  onClose,
}: {
  clinicId: string;
  branch: ClinicBranch;
  shownName: string;
  shownAddress: string;
  onClose: () => void;
}) {
  const t = useTranslations("desk");
  const platform = useTranslations("platform");
  const common = useTranslations("common");
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

  async function remove(): Promise<void> {
    const ok = await clinicSend(`/clinics/${clinicId}/branches/${branch.id}`, "DELETE");
    if (ok) window.location.reload();
    else setMessage(t("branchProtected"));
  }

  return (
    <form className="grid gap-3.5 border-t border-line px-5 py-4" onSubmit={(event) => void onSubmit(event)}>
      <label className={fieldClass}>
        {t("branchName")}
        <input name="name" required maxLength={80} defaultValue={shownName} className="field-control" />
      </label>
      <label className={fieldClass}>
        {platform("address")}
        <input name="address" maxLength={160} defaultValue={shownAddress} className="field-control" />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
        <button className="btn btn-secondary w-fit" type="button" onClick={onClose}>{common("cancel")}</button>
        <button className="cursor-pointer text-sm font-semibold text-danger" type="button" onClick={() => void remove()}>
          {t("remove")}
        </button>
      </div>
      {message ? <p className="m-0 text-danger">{message}</p> : null}
    </form>
  );
}

function storedValue(typed: string, shown: string, stored: string): string {
  return typed.trim() === shown.trim() ? stored : typed.trim();
}
