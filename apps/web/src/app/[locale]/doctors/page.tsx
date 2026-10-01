import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { DoctorCard } from "@/shared/public-types";
import { DoctorTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

export default async function DoctorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ name?: string; specialty?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const queryParams = await searchParams;
  const t = await getTranslations("catalog");
  const common = await getTranslations("common");
  const query = new URLSearchParams();
  if (queryParams.name) query.set("name", queryParams.name);
  if (queryParams.specialty) query.set("specialty", queryParams.specialty);
  const suffix = query.size > 0 ? `?${query}` : "";
  const doctors = await publicGet<DoctorCard[]>(`/public/doctors${suffix}`);
  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))] max-md:pt-[18px]">
      <h1>{t("doctorsTitle")}</h1>
      <form
        className="flex gap-2 rounded-full border border-line bg-white p-2 shadow-soft focus-within:border-accent/45 focus-within:shadow-[0_14px_36px_rgba(0,167,157,0.12)] max-md:flex-col max-md:rounded-[18px]"
        action={getPathname({ locale, href: "/doctors" })}
      >
        <input
          name="name"
          defaultValue={queryParams.name ?? ""}
          placeholder={common("name")}
          aria-label={t("doctorName")}
          className="flex-1 border-0 bg-transparent px-4 py-3 outline-none"
        />
        <input
          name="specialty"
          defaultValue={queryParams.specialty ?? ""}
          placeholder={t("specialty")}
          aria-label={t("specialty")}
          className="flex-1 border-0 bg-transparent px-4 py-3 outline-none"
        />
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent max-md:w-full"
          type="submit"
        >
          {common("search")}
        </button>
      </form>
      {doctors.length === 0 ? <EmptyState>{t("emptyDoctorSearch")}</EmptyState> : null}
      <div className="grid gap-5 max-md:gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => <DoctorTile key={doctor.id} doctor={doctor} />)}
      </div>
    </div>
  );
}
