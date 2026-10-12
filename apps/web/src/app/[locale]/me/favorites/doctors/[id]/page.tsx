import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DoctorProfile, type DoctorPageData } from "@/features/catalog/doctor-profile";
import { loadPatientAccount, PatientSignIn } from "@/features/portal/patient-account";
import { loadFavoriteSet } from "@/features/portal/patient-favorites";
import { FavoriteReturn } from "@/features/portal/favorite-return";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";

export default async function FavoriteDoctorPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = await params;
  const locale = prepareLocale(raw);
  if (!(await loadPatientAccount(locale))) return <PatientSignIn />;
  const [doctor, favorites] = await Promise.all([
    publicGet<DoctorPageData>(`/public/doctors/${id}`, locale).catch(() => null),
    loadFavoriteSet(locale),
  ]);
  if (!doctor) notFound();
  const common = await getTranslations("common");
  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={doctor.user.displayName}>
      <div className="grid gap-4">
        <FavoriteReturn />
        <DoctorProfile
          doctor={doctor}
          saved={favorites?.doctorIds.includes(doctor.id) ?? false}
          clinicHref={`/me/favorites/clinics/${doctor.clinic.id}`}
          pageHeading={false}
        />
      </div>
    </PatientPortalShell>
  );
}
