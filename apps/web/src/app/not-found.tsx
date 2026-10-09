import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageStack } from "@/shared/ui/page-frame";

export default async function NotFound() {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("common");
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PageStack>
        <h1>{t("notFoundTitle")}</h1>
        <p className="m-0 max-w-[42rem] text-lg leading-relaxed text-muted">{t("notFoundHint")}</p>
        <Link className="btn btn-primary w-fit" href="/">
          {t("homeLink")}
        </Link>
      </PageStack>
    </NextIntlClientProvider>
  );
}
