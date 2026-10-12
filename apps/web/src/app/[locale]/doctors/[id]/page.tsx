import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DoctorProfile, type DoctorPageData } from "@/features/catalog/doctor-profile";
import { loadFavoriteSet } from "@/features/portal/patient-favorites";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
import { PageStack } from "@/shared/ui/page-frame";

export default async function DoctorPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = await params;
  const locale = prepareLocale(raw);
  const [doctor, favorites] = await Promise.all([
    publicGet<DoctorPageData>(`/public/doctors/${id}`, locale).catch(() => null),
    loadFavoriteSet(locale),
  ]);
  if (!doctor) notFound();
  const t = await getTranslations("common");
  const catalog = await getTranslations("catalog");
  const saved = favorites ? favorites.doctorIds.includes(doctor.id) : null;
  return (
    <PageStack>
      <Breadcrumb
        items={[
          { href: "/", label: t("homeLink") },
          { href: "/doctors", label: catalog("doctorsTitle") },
          { label: doctor.user.displayName },
        ]}
      />
      <DoctorProfile doctor={doctor} saved={saved} clinicHref={`/clinics/${doctor.clinic.id}`} />
    </PageStack>
  );
}
