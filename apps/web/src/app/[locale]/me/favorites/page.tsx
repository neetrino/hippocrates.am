import { getTranslations } from "next-intl/server";
import { loadPatientAccount, PatientSignIn } from "@/features/portal/patient-account";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { prepareLocale } from "@/i18n/locale";

export default async function PatientFavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  if (!(await loadPatientAccount(locale))) return <PatientSignIn />;

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("favorites")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("emptyFavorites")}</p>
      </section>
    </PatientPortalShell>
  );
}
