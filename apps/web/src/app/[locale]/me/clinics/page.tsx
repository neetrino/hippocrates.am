import { getTranslations } from "next-intl/server";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { getPathname } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

export default async function PortalClinicsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  await requireSuperAdmin();
  const { name } = await searchParams;
  const t = await getTranslations("catalog");
  const common = await getTranslations("common");
  const query = name ? `?name=${encodeURIComponent(name)}` : "";
  const clinics = await publicGet<ClinicCard[]>(`/public/clinics${query}`);

  return (
    <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={t("clinicsTitle")}>
      <div className="grid gap-4">
        <form
          className="flex gap-2 rounded-full border border-line bg-white p-2 shadow-soft focus-within:border-accent/45 focus-within:shadow-[0_14px_36px_rgba(0,167,157,0.12)] max-md:flex-col max-md:rounded-[18px]"
          action={getPathname({ locale, href: "/me/clinics" })}
        >
          <input
            name="name"
            defaultValue={name ?? ""}
            placeholder={common("name")}
            aria-label={t("clinicName")}
            className="flex-1 border-0 bg-transparent px-4 py-3 outline-none"
          />
          <button
            className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent max-md:w-full"
            type="submit"
          >
            {common("search")}
          </button>
        </form>
        {clinics.length === 0 ? <EmptyState>{t("emptyClinicSearch")}</EmptyState> : null}
        <div className="grid gap-4 max-md:gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clinics.map((clinic, index) => (
            <ClinicTile key={clinic.id} clinic={clinic} loading={index === 0 ? "eager" : undefined} />
          ))}
        </div>
      </div>
    </AdminPortalShell>
  );
}
