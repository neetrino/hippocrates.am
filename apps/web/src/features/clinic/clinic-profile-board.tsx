"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BranchCreateForm, ClinicBranchList, type ClinicBranch } from "@/features/clinic/clinic-branches";
import { ClinicIdentityCard, type ClinicLocaleDraft, type ClinicProfile } from "@/features/clinic/clinic-profile-form";

export function ClinicProfileBoard({
  clinicId,
  clinic,
  locales,
  branches,
  localeAddress,
}: {
  clinicId: string;
  clinic: ClinicProfile;
  locales: Record<"en" | "ru", ClinicLocaleDraft>;
  branches: ClinicBranch[];
  localeAddress: string;
}) {
  const t = useTranslations("desk");
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-6">
      <button className="btn btn-primary min-h-10 w-fit px-4" type="button" onClick={() => setOpen((value) => !value)}>
        {t("addBranch")}
      </button>
      {open ? <BranchCreateForm clinicId={clinicId} onClose={() => setOpen(false)} /> : null}
      <ClinicIdentityCard clinicId={clinicId} clinic={clinic} locales={locales} />
      <ClinicBranchList
        clinicId={clinicId}
        branches={branches}
        clinicAddress={clinic.address}
        localeAddress={localeAddress}
      />
    </div>
  );
}
