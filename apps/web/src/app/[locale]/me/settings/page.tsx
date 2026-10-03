import { getTranslations } from "next-intl/server";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { SettingsPassword } from "@/features/portal/settings-password";
import { SettingsPhoto } from "@/features/portal/settings-photo";
import { SettingsProfile } from "@/features/portal/settings-profile";
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
  if (me.role !== "PATIENT") redirect({ href: "/me", locale });

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("settings")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        <SettingsPhoto
          name={me.displayName}
          photoUrl={me.photoUrl}
          roleLabel={common("PATIENT")}
          changeLabel={t("changePhoto")}
          changeAction={t("photoChange")}
          deleteAction={t("photoDelete")}
          failed={t("photoFailed")}
          invalid={t("photoInvalid")}
        />
        <SettingsProfile displayName={me.displayName} email={me.email} phone={me.phone} />
        <SettingsPassword />
      </section>
    </PatientPortalShell>
  );
}
