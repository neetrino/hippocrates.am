import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ClinicProfile, type ClinicPageData } from "@/features/catalog/clinic-profile";
import { loadFavoriteSet } from "@/features/portal/patient-favorites";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
import { PageStack } from "@/shared/ui/page-frame";

export default async function ClinicPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = await params;
  const locale = prepareLocale(raw);
  const [clinic, favorites] = await Promise.all([
    publicGet<ClinicPageData>(`/public/clinics/${id}`, locale).catch(() => null),
    loadFavoriteSet(locale),
  ]);
  if (!clinic) notFound();
  const catalog = await getTranslations("catalog");
  const common = await getTranslations("common");
  const saved = favorites ? favorites.clinicIds.includes(clinic.id) : null;
  return (
    <PageStack>
      <Breadcrumb
        items={[
          { href: "/", label: common("homeLink") },
          { href: "/clinics", label: catalog("clinicsTitle") },
          { label: clinic.name },
        ]}
      />
      <ClinicProfile clinic={clinic} saved={saved} doctorHref={(doctorId) => `/doctors/${doctorId}`} />
    </PageStack>
  );
}
