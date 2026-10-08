import { getTranslations } from "next-intl/server";
import { ClinicBranches, type ClinicBranch } from "@/features/clinic/clinic-branches";
import { ClinicLocaleForm } from "@/features/clinic/clinic-locale-form";
import { ClinicProfileForm, type ClinicProfile } from "@/features/clinic/clinic-profile-form";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";

type LocaleDoctor = { id: string; name: string; displayName: string; specialty: string; bio: string };
type LocaleDraft = { name: string; district: string; address: string; description: string; doctors: LocaleDoctor[] };
type ClinicLocales = { en: LocaleDraft; ru: LocaleDraft };

export default async function ClinicProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const me = await requireClinicAdmin();
  const [profile, branches, locales] = await Promise.all([
    sessionGet<ClinicProfile>(`/clinics/${me.clinicId}/profile`),
    sessionGet<ClinicBranch[]>(`/clinics/${me.clinicId}/branches`),
    sessionGet<ClinicLocales>(`/clinics/${me.clinicId}/locales`),
  ]);

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={portal("clinicProfile")}>
      <div className="grid gap-8">
        {profile ? <ClinicProfileForm clinicId={me.clinicId} clinic={profile} /> : null}
        <ClinicBranches clinicId={me.clinicId} branches={branches ?? []} />
        {locales ? <ClinicLocaleForm clinicId={me.clinicId} texts={locales} /> : null}
      </div>
    </ClinicManagerShell>
  );
}
