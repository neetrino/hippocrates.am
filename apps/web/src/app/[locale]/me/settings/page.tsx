import { getTranslations } from "next-intl/server";
import { DoctorPortalShell } from "@/features/portal/doctor-portal-shell";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { SettingsCard } from "@/features/portal/settings-card";
import { Link, redirect } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function PatientSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const nav = await getTranslations("nav");
  const me = await sessionGet<Me>("/auth/me");
  if (!me) {
    return (
      <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
        <p>
          {t("signIn")} <Link href="/login">{nav("login")}</Link>
        </p>
      </div>
    );
  }
  if (me.role === "SUPER_ADMIN") redirect({ href: "/super-admin", locale });
  if (me.role === "ADMIN") redirect({ href: "/clinic/settings", locale });
  if (me.role === "DOCTOR") {
    return (
      <DoctorPortalShell eyebrow={common("DOCTOR")} title={t("settings")}>
        <SettingsCard
          displayName={me.displayName}
          email={me.email}
          phone={me.phone}
          photoUrl={me.photoUrl}
          roleLabel={common("DOCTOR")}
        />
      </DoctorPortalShell>
    );
  }
  if (me.role !== "PATIENT") redirect({ href: "/me", locale });

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("settings")}>
      <SettingsCard displayName={me.displayName} email={me.email} phone={me.phone} photoUrl={me.photoUrl} />
    </PatientPortalShell>
  );
}
