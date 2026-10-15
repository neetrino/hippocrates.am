import { getLocale, getTranslations } from "next-intl/server";
import { type ClinicBranch } from "@/features/clinic/clinic-branches";
import { type ClinicLocaleDraft, type ClinicProfile } from "@/features/clinic/clinic-profile-form";
import { ClinicProfileBoard } from "@/features/clinic/clinic-profile-board";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";
import { ListPagination, listPage } from "@/shared/ui/list-pagination";

type ClinicLocales = { en: ClinicLocaleDraft; ru: ClinicLocaleDraft };

export default async function ClinicProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const page = listPage((await searchParams).page);
  const me = await requireClinicAdmin();
  const [profile, branches, locales] = await Promise.all([
    sessionGet<ClinicProfile>(`/clinics/${me.clinicId}/profile`),
    sessionGet<ClinicBranch[]>(`/clinics/${me.clinicId}/branches${page > 1 ? `?page=${page}` : ""}`),
    sessionGet<ClinicLocales>(`/clinics/${me.clinicId}/locales`),
  ]);

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={portal("clinicProfile")}>
      {profile && locales ? (
        <ClinicProfileBoard
          clinicId={me.clinicId}
          clinic={profile}
          locales={locales}
          branches={branches ?? []}
          localeAddress={localeAddress(locale, profile.address, locales)}
        />
      ) : null}
      <ListPagination page={page} itemCount={branches?.length ?? 0} />
    </ClinicManagerShell>
  );
}

function localeAddress(locale: string, address: string, locales: ClinicLocales): string {
  const foreign = locale === "en" ? locales.en.address : locale === "ru" ? locales.ru.address : "";
  return foreign.trim() ? foreign : address;
}
