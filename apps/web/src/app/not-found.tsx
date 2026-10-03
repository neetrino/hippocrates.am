import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("common");
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
        <h1>{t("notFoundTitle")}</h1>
        <p className="m-0 max-w-[42rem] text-lg leading-relaxed text-muted">{t("notFoundHint")}</p>
        <Link
          className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent"
          href="/"
        >
          {t("homeLink")}
        </Link>
      </div>
    </NextIntlClientProvider>
  );
}
