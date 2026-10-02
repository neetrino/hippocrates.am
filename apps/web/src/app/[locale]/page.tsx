import { getTranslations } from "next-intl/server";
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
  const data = await publicGet<HomeData>("/public/home");
  const action = getPathname({ locale, href: "/clinics" });
  return (
    <div className="mx-auto w-[min(var(--max-width-shell),calc(100%-48px))] max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      <section className="grid gap-7 py-14 pb-7 max-md:gap-7 max-md:py-7 max-md:pb-[18px]">
        <div className="grid max-w-[720px] gap-4">
          <h1 className="bg-linear-to-br from-ink via-[#1a3d3a] to-accent bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="m-0 max-w-[42rem] text-lg leading-[1.7] font-light tracking-[0.01em] text-muted max-md:text-base">
            {t("lede")}
          </p>
          <form
            className="flex gap-2 rounded-full border border-line bg-white p-2 shadow-soft focus-within:border-accent/45 focus-within:shadow-[0_14px_36px_rgba(0,167,157,0.12)] max-md:flex-col max-md:rounded-[18px]"
            action={action}
          >
            <input
              name="name"
              placeholder={t("clinicPlaceholder")}
              aria-label={t("clinicPlaceholder")}
              className="flex-1 border-0 bg-transparent px-4 py-3 outline-none"
            />
            <button
              className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent max-md:w-full"
              type="submit"
            >
              {common("search")}
            </button>
          </form>
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
