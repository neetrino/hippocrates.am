import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ClinicProfile, type ClinicPageData } from "@/features/catalog/clinic-profile";
import { loadPatientAccount, PatientSignIn } from "@/features/portal/patient-account";
import { loadFavoriteSet } from "@/features/portal/patient-favorites";
import { FavoriteReturn } from "@/features/portal/favorite-return";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";

export default async function FavoriteClinicPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = await params;
  const locale = prepareLocale(raw);
  if (!(await loadPatientAccount(locale))) return <PatientSignIn />;
  const [clinic, favorites] = await Promise.all([
    publicGet<ClinicPageData>(`/public/clinics/${id}`, locale).catch(() => null),
    loadFavoriteSet(locale),
  ]);
  if (!clinic) notFound();
  const common = await getTranslations("common");
  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={clinic.name}>
      <div className="grid gap-4">
        <FavoriteReturn />
        <ClinicProfile
          clinic={clinic}
          saved={favorites?.clinicIds.includes(clinic.id) ?? false}
          doctorHref={(doctorId) => `/me/favorites/doctors/${doctorId}`}
          pageHeading={false}
        />
      </div>
    </PatientPortalShell>
  );
}
