import { getTranslations } from "next-intl/server";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { SettingsCard } from "@/features/portal/settings-card";
import { prepareLocale } from "@/i18n/locale";

export default async function ClinicSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const me = await requireClinicAdmin();

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={t("settings")}>
      <SettingsCard
        displayName={me.displayName}
        email={me.email}
        phone={me.phone}
        photoUrl={me.photoUrl}
        roleLabel={common("ADMIN")}
      />
    </ClinicManagerShell>
  );
}
