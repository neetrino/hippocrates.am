import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/features/auth/login-form";
import { BrandLogo } from "@/shared/ui/brand-logo";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("auth");
  return (
    <section className="grid min-h-[calc(100vh-12rem)] place-items-center px-5 pt-8 pb-16">
      <div className="grid w-[min(420px,100%)] gap-5 rounded-card bg-surface px-7 py-8 shadow-soft max-sm:px-5 max-sm:py-6">
        <div className="grid place-items-center">
          <Link href="/" className="inline-flex items-center justify-center leading-none" aria-label="Hippocrates">
            <BrandLogo size="auth" priority />
          </Link>
        </div>
        <div className="grid gap-2">
          <h1 className="text-[clamp(1.55rem,3.2vw,1.85rem)]">{t("loginTitle")}</h1>
          <p className="m-0 max-w-[38ch] text-[0.95rem] leading-relaxed text-muted">{t("loginHint")}</p>
        </div>
        <LoginForm />
        <p className="m-0 border-t border-line pt-4 text-center text-[0.9rem] text-muted">
          {t("noAccount")}{" "}
          <Link href="/register" className="font-semibold text-ink underline underline-offset-4 hover:text-accent">
            {t("goRegister")}
          </Link>
        </p>
      </div>
    </section>
  );
}
