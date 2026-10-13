"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ClinicServiceForm } from "@/features/clinic/clinic-forms";
import { DoctorServiceGroup, type ClinicOffering, type ServiceDoctor } from "@/features/clinic/clinic-service-list";
import { EmptyState } from "@/shared/ui/empty-state";

export function ClinicServiceBoard({
  clinicId,
  doctors,
  offerings,
}: {
  clinicId: string;
  doctors: ServiceDoctor[];
  offerings: ClinicOffering[];
}) {
  const t = useTranslations("desk");
  const [open, setOpen] = useState(false);
  const [doctorId, setDoctorId] = useState("");

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
          {t("add")}
        </button>
      ) : null}
      {open && doctors.length > 0 ? (
        <ClinicServiceForm
          key={doctorId || "new"}
          clinicId={clinicId}
          doctors={doctors.map((doctor) => ({ id: doctor.id, name: doctor.user.displayName }))}
          initialDoctorId={doctorId}
          onClose={closeForm}
        />
      ) : null}
      {doctors.length === 0 ? <EmptyState>{t("emptyServices")}</EmptyState> : null}
      {doctors.map((doctor) => (
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
