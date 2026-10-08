import { getTranslations } from "next-intl/server";
import { HomeClinicSearch } from "@/features/catalog/home-clinic-search";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

type HomeData = { clinics: ClinicCard[] };

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  const common = await getTranslations("common");
  const catalog = await getTranslations("catalog");
  const [data, clinics] = await Promise.all([
    publicGet<HomeData>("/public/home", locale),
    publicGet<ClinicCard[]>("/public/clinics", locale),
  ]);
  const action = getPathname({ locale, href: "/clinics" });
  return (
    <div className="mx-auto w-[min(var(--max-width-shell),calc(100%-48px))] max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      <section className="grid gap-7 py-14 pb-7 max-md:gap-7 max-md:py-7 max-md:pb-[18px]">
        <div className="grid max-w-[720px] gap-4">
          <h1 className="leading-[1.35]">{t("title")}</h1>
          <p className="m-0 max-w-[42rem] text-lg leading-[1.7] font-light tracking-[0.01em] text-muted max-md:text-base">
            {t("lede")}
          </p>
          <HomeClinicSearch
            clinics={clinics}
            action={action}
            placeholder={t("clinicPlaceholder")}
            searchLabel={common("search")}
            emptyLabel={catalog("emptyClinicSearch")}
          />
        </div>
      </section>
      <section className="grid gap-[18px] pt-7 max-md:pt-[18px]">
        <div className="flex items-end justify-between gap-3 max-md:items-center">
          <h2>{nav("clinics")}</h2>
          <Link href="/clinics" className="font-semibold text-accent hover:underline hover:underline-offset-[3px]">
            {common("seeAll")}
          </Link>
        </div>
        {data.clinics.length === 0 ? <EmptyState>{t("emptyClinics")}</EmptyState> : null}
        <div className="grid gap-4 max-md:gap-3 md:grid-cols-3">
          {data.clinics.map((clinic, index) => (
            <ClinicTile key={clinic.id} clinic={clinic} loading={index === 0 ? "eager" : undefined} />
          ))}
        </div>
      </section>
    </div>
  );
}
