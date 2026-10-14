"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { VerificationActions } from "@/features/portal/verification-actions";
import {
  statusChipClass,
  type VerificationClinic,
  type VerificationDoctor,
  type VerificationQueue,
} from "@/features/portal/verification-status";
import { EmptyState } from "@/shared/ui/empty-state";
import { cn } from "@/shared/ui/cn";

type Scope = "clinic" | "doctor";

export function VerificationBoard({ queue }: { queue: VerificationQueue }) {
  const t = useTranslations("portal");
  const [scope, setScope] = useState<Scope>("clinic");
  const clinics = queue.clinics;
  const doctors = queue.doctors;
  const empty = clinics.length === 0 && doctors.length === 0;

  return (
    <div className="grid gap-5">
      <p className="m-0 max-w-[40rem] text-lg leading-relaxed text-muted">{t("verifyLede")}</p>
      {empty ? <EmptyState>{t("verifyEmpty")}</EmptyState> : null}
      {empty ? null : (
        <div className="flex flex-wrap gap-2">
          <ScopePill active={scope === "clinic"} label={`${t("verifyClinics")} · ${clinics.length}`} onClick={() => setScope("clinic")} />
          <ScopePill active={scope === "doctor"} label={`${t("verifyDoctors")} · ${doctors.length}`} onClick={() => setScope("doctor")} />
        </div>
      )}
      {scope === "clinic" ? (
        <div className="grid gap-3">
          {clinics.map((clinic) => (
            <ClinicReviewCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {doctors.map((doctor) => (
            <DoctorReviewCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClinicReviewCard({ clinic }: { clinic: VerificationClinic }) {
  const t = useTranslations("portal");
  return (
    <article className="grid gap-4 rounded-card bg-white p-5 shadow-soft md:grid-cols-[1fr_auto] md:items-center">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={clinic.status} />
          <Link href={`/super-admin/clinics/${clinic.id}`} className="font-display text-[1.15rem] font-semibold text-ink hover:text-accent">
            {clinic.name}
          </Link>
        </div>
        {clinic.detail ? <p className="m-0 text-sm text-muted">{clinic.detail}</p> : null}
      </div>
      <VerificationActions kind="clinic" id={clinic.id} status={clinic.status} />
      <span className="sr-only">{t("verifyClinics")}</span>
    </article>
  );
}

function DoctorReviewCard({ doctor }: { doctor: VerificationDoctor }) {
  return (
    <article className="grid gap-4 rounded-card bg-white p-5 shadow-soft md:grid-cols-[1fr_auto] md:items-center">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={doctor.status} />
          <p className="m-0 font-display text-[1.15rem] font-semibold">{doctor.name}</p>
        </div>
        <p className="m-0 text-sm text-muted">
          {doctor.detail}
          {doctor.clinicName ? ` · ${doctor.clinicName}` : ""}
        </p>
      </div>
      <VerificationActions kind="doctor" id={doctor.id} status={doctor.status} />
    </article>
  );
}

export function StatusChip({ status }: { status: string }) {
  const t = useTranslations("portal");
  const labels = {
    APPROVED: t("statusApproved"),
    REJECTED: t("statusRejected"),
    SUSPENDED: t("statusSuspended"),
    UNDER_REVIEW: t("statusReview"),
    DRAFT: t("statusDraft"),
    SUBMITTED: t("statusSubmitted"),
  } as const;
  const label = status in labels ? labels[status as keyof typeof labels] : t("statusSubmitted");
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusChipClass(status))}>
      {label}
    </span>
  );
}

function ScopePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-2 text-sm font-semibold",
        active ? "border-accent bg-accent-soft text-accent" : "border-line bg-white text-muted",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

