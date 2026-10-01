import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { RegisterForm } from "@/features/auth/register-form";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
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
          <h1>{t("registerTitle")}</h1>
          <p className="muted">{t("registerHint")}</p>
        </div>
        <RegisterForm />
        <div className="auth-switch">
          <p className="muted">{t("hasAccount")}</p>
          <Link href="/login" className="btn btn-ghost btn-block">{t("goLogin")}</Link>
        </div>
      </div>
    </section>
  );
}
