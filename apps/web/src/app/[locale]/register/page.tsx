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
    <section className="grid min-h-[calc(100vh-180px)] place-items-center bg-white px-5 pt-10 pb-16">
      <div className="grid w-[min(520px,100%)] max-w-full gap-4 rounded-3xl border border-line bg-white px-[22px] pt-[22px] pb-5 shadow-[0_14px_32px_rgba(20,36,40,0.06)] max-sm:w-[min(100%,400px)] max-sm:rounded-[22px] max-sm:px-3.5 max-sm:pt-[18px] max-sm:pb-4">
        <div className="grid place-items-center">
          <Link href="/" className="inline-flex items-center justify-center leading-none" aria-label="Hippocrates">
            <Image
              src="/brand/hippocrates-logo.png"
              alt="Hippocrates"
              width={180}
              height={110}
              className="block h-[58px] w-auto object-contain max-sm:h-[52px]"
              priority
            />
          </Link>
        </div>
        <div className="grid gap-1.5 text-left">
          <h1 className="text-[clamp(1.55rem,3.2vw,1.85rem)] tracking-[-0.03em]">{t("registerTitle")}</h1>
          <p className="m-0 max-w-[38ch] text-[0.92rem] leading-[1.45] text-muted">{t("registerHint")}</p>
        </div>
        <RegisterForm />
        <p className="m-0 border-t border-accent/12 pt-2.5 text-center text-[0.88rem] text-muted">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-semibold text-ink underline underline-offset-[3px] hover:text-accent">
            {t("goLogin")}
          </Link>
        </p>
      </div>
    </section>
  );
}
