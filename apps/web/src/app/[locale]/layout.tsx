import type { Metadata } from "next";
import type { ReactNode } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMe } from "@/shared/session-api";
import { getSiteUrl } from "@/shared/site-url";
import { AccountPhotoProvider } from "@/shared/ui/account-menu";
import { DocumentLang } from "@/shared/ui/document-lang";
import { SiteFooter } from "@/shared/ui/site-footer";
import { SiteHeader } from "@/shared/ui/site-header";

const ogLocale: Record<string, string> = {
  hy: "hy_AM",
  en: "en_US",
  ru: "ru_RU",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return { title: "Hippocrates" };
  const t = await getTranslations({ locale, namespace: "meta" });
  const description = t("description");
  const shareImage = {
    url: "/brand/og.png",
    width: 1200,
    height: 630,
    alt: "Hippocrates",
  };
  return {
    metadataBase: getSiteUrl(),
    title: {
      default: "Hippocrates",
      template: "%s · Hippocrates",
    },
    description,
    applicationName: "Hippocrates",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/brand/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      type: "website",
      locale: ogLocale[locale] ?? "hy_AM",
      siteName: "Hippocrates",
      title: "Hippocrates",
      description,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: "Hippocrates",
      description,
      images: [shareImage.url],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [messages, me] = await Promise.all([getMessages(), getMe()]);
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AccountPhotoProvider photoUrl={me?.photoUrl ?? null}>
        <DocumentLang locale={locale} />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </AccountPhotoProvider>
    </NextIntlClientProvider>
  );
}
