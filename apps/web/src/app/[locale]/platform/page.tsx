import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { redirect, Link } from "@/i18n/navigation";
import { JsonForm } from "@/shared/json-form";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function PlatformPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("platform");
  const nav = await getTranslations("nav");
  const me = await sessionGet<Me>("/auth/me");

  if (me?.role === "SUPER_ADMIN") {
    redirect({ href: "/super-admin/clinics", locale });
  }

  return (
    <section className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      {!me ? (
        <p className="m-0">
          <Link href="/login">{nav("login")}</Link>
        </p>
      ) : null}
      <div className="mx-auto my-12 grid w-[min(440px,100%)] gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft">
        <h1>{t("title")}</h1>
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
    </section>
  );
}
