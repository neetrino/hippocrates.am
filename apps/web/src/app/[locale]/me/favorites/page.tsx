import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { loadPatientAccount, PatientSignIn } from "@/features/portal/patient-account";
import { loadFavoriteCards } from "@/features/portal/patient-favorites";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { prepareLocale } from "@/i18n/locale";
import { ClinicTile, DoctorTile } from "@/shared/ui/catalog-cards";

export default async function PatientFavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  if (!(await loadPatientAccount(locale))) return <PatientSignIn />;
  const favorites = await loadFavoriteCards(locale);
  const empty = favorites.clinics.length === 0 && favorites.doctors.length === 0;

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("favorites")}>
      <div className="grid gap-5">
        {empty ? <p className="m-0 rounded-card bg-surface px-5 py-8 text-muted shadow-soft">{t("emptyFavorites")}</p> : null}
        <FavoriteGroup title={t("favoriteClinics")} empty={favorites.clinics.length === 0}>
          <div className="grid gap-4 sm:grid-cols-2">
            {favorites.clinics.map((clinic) => (
              <ClinicTile key={clinic.id} clinic={clinic} saved href={`/me/favorites/clinics/${clinic.id}`} />
            ))}
          </div>
        </FavoriteGroup>
        <FavoriteGroup title={t("favoriteDoctors")} empty={favorites.doctors.length === 0}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.doctors.map((doctor) => (
              <DoctorTile key={doctor.id} doctor={doctor} saved href={`/me/favorites/doctors/${doctor.id}`} />
            ))}
          </div>
        </FavoriteGroup>
      </div>
    </PatientPortalShell>
  );
}

function FavoriteGroup({ title, empty, children }: { title: string; empty: boolean; children: ReactNode }) {
  if (empty) return null;
  return (
    <section className="grid gap-3">
      <h2 className="m-0 text-sm font-semibold text-muted">{title}</h2>
      {children}
    </section>
  );
}
