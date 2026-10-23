"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ClinicServiceForm } from "@/features/clinic/clinic-forms";
import { DoctorServiceGroup, type ClinicOffering, type ServiceDoctor } from "@/features/clinic/clinic-service-list";
import { portalName } from "@/shared/clinic-label";
import { EmptyState } from "@/shared/ui/empty-state";

export function ClinicServiceBoard({
  clinicId,
  doctors,
  offerings,
  showEmptyDoctors = true,
}: {
  clinicId: string;
  doctors: ServiceDoctor[];
  offerings: ClinicOffering[];
  showEmptyDoctors?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("desk");
  const [open, setOpen] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const listedDoctors = servicePageDoctors(doctors, offerings, showEmptyDoctors);

  function closeForm(): void {
    setOpen(false);
    setDoctorId("");
  }

  function addFor(id = ""): void {
    if (open && doctorId === id) {
      closeForm();
      return;
    }
    setDoctorId(id);
    setOpen(true);
  }

  return (
    <div className="grid gap-6">
      {doctors.length > 0 ? (
        <button className="btn btn-primary min-h-10 w-fit px-4" type="button" onClick={() => addFor()}>
          {t("addService")}
        </button>
      ) : null}
      {open && doctors.length > 0 ? (
        <ClinicServiceForm
          key={doctorId || "new"}
          clinicId={clinicId}
          doctors={doctors.map((doctor) => ({ id: doctor.id, name: portalName(doctor.user.displayName, locale, doctor.locales) }))}
          initialDoctorId={doctorId}
          onClose={closeForm}
        />
      ) : null}
      {listedDoctors.length === 0 ? <EmptyState>{t("emptyServices")}</EmptyState> : null}
      {listedDoctors.map((doctor) => (
        <DoctorServiceGroup
          key={doctor.id}
          clinicId={clinicId}
          doctor={doctor}
          offerings={offerings.filter((item) => item.doctor.id === doctor.id)}
          onAdd={() => addFor(doctor.id)}
        />
      ))}
    </div>
  );
}

function servicePageDoctors(
  doctors: ServiceDoctor[],
  offerings: ClinicOffering[],
  includeEmpty: boolean,
): ServiceDoctor[] {
  const byId = new Map(doctors.map((doctor) => [doctor.id, doctor]));
  for (const { doctor } of offerings) {
    if (byId.has(doctor.id)) continue;
    byId.set(doctor.id, {
      id: doctor.id,
      specialty: "",
      published: doctor.published,
      photoUrl: null,
      user: doctor.user,
    });
  }
  if (includeEmpty) return [...byId.values()];
  const offeringDoctorIds = new Set(offerings.map(({ doctor }) => doctor.id));
  return [...byId.values()].filter(({ id }) => offeringDoctorIds.has(id));
}
