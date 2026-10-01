import { getTranslations } from "next-intl/server";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { prepareLocale } from "@/i18n/locale";
import { JsonForm } from "@/shared/json-form";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";
import { Link } from "@/i18n/navigation";

export default async function PlatformPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("platform");
  const common = await getTranslations("common");
  const nav = await getTranslations("nav");
  const me = await sessionGet<Me>("/auth/me");

  const form = (
    <div className="mx-auto grid w-[min(480px,100%)] gap-3.5 rounded-[1.6rem] border border-line bg-white p-5 shadow-soft md:p-7">
      <h2 className="text-[clamp(1.45rem,2.4vw,1.85rem)]">{t("title")}</h2>
      <p className="m-0 text-muted">{t("hint")}</p>
      <JsonForm
        action="/clinics"
        label={t("submit")}
        next="/me"
        fields={[
          { name: "name", label: t("clinicName") },
          { name: "address", label: t("address") },
          { name: "phone", label: t("phone") },
          { name: "adminName", label: t("adminName") },
          { name: "adminEmail", label: t("adminEmail"), type: "email" },
          { name: "adminPassword", label: t("adminPassword"), type: "password" },
        ]}
      />
    </div>
  );

  if (me?.role === "SUPER_ADMIN") {
    return (
      <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={t("title")}>
        {form}
      </AdminPortalShell>
    );
  }

  return (
    <section className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      {!me ? (
        <p className="m-0">
          <Link href="/login">{nav("login")}</Link>
        </p>
      ) : null}
      <div className="mx-auto my-12 w-[min(440px,100%)]">{form}</div>
    </section>
  );
}
