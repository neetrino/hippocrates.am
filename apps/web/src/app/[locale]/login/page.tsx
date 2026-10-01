import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { JsonForm } from "@/shared/json-form";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("auth");
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Image
            src="/brand/hippocrates-logo.png"
            alt="Hippocrates"
            width={160}
            height={98}
            className="auth-logo"
            priority
          />
        </div>
        <div className="auth-copy">
          <h1>{t("loginTitle")}</h1>
          <p className="muted">{t("loginHint")}</p>
        </div>
        <JsonForm
          action="/auth/login"
          label={t("enter")}
          next="/me"
          fields={[
            { name: "email", label: t("email"), type: "email" },
            { name: "password", label: t("password"), type: "password" },
          ]}
        />
        <div className="auth-switch">
          <p className="muted">{t("noAccount")}</p>
          <Link href="/register" className="btn btn-ghost btn-block">{t("goRegister")}</Link>
        </div>
      </div>
    </section>
  );
}
