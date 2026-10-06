import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/features/booking/booking-panel";
import { initialSlots } from "@/features/booking/initial-slots";
import { Link } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { formatAmount } from "@/shared/format";
import { localizedServiceName } from "@/shared/service-name";
import { publicGet } from "@/shared/public-api";
import type { DoctorCard, OfferingCard } from "@/shared/public-types";
import { Breadcrumb } from "@/shared/ui/breadcrumb";
import { PageStack } from "@/shared/ui/page-frame";
import { Photo } from "@/shared/ui/photo";

type DoctorPageData = DoctorCard & { offerings: OfferingCard[] };

export default async function DoctorPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = await params;
  const locale = prepareLocale(raw);
  const doctor = await publicGet<DoctorPageData>(`/public/doctors/${id}`, locale).catch(() => null);
  if (!doctor) notFound();
  const t = await getTranslations("common");
  const catalog = await getTranslations("catalog");
  const services = await getTranslations("services");
  const offerings = doctor.offerings.map((item) => ({ ...item, doctorId: doctor.id }));
  const slots = await initialSlots(offerings[0]);
  return (
    <PageStack>
      <Breadcrumb
        items={[
          { href: "/", label: t("homeLink") },
          { href: "/doctors", label: catalog("doctorsTitle") },
          { label: doctor.user.displayName },
        ]}
      />
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] md:items-start">
        <article className="overflow-hidden rounded-card bg-surface shadow-soft">
          <div className="relative aspect-4/5 max-h-[32rem] bg-sand md:aspect-16/10 md:max-h-none">
            <Photo src={doctor.photoUrl} alt={doctor.user.displayName} sizes="(max-width: 768px) 100vw, 70vw" />
          </div>
          <div className="grid gap-3 px-6 py-6 max-md:px-5 max-md:py-5">
            <p className="kicker">{doctor.specialty}</p>
            <h1>{doctor.user.displayName}</h1>
            <p className="m-0">
              <Link href={`/clinics/${doctor.clinic.id}`} className="text-accent hover:text-accent-hover">
                {doctor.clinic.name}
              </Link>
            </p>
            {doctor.bio ? <p className="m-0 max-w-[42rem] text-[1.05rem] leading-relaxed text-muted">{doctor.bio}</p> : null}
            <div className="mt-2 divide-y divide-line overflow-hidden rounded-card border border-line">
              {offerings.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <span>{localizedServiceName(item.name, services)}</span>
                  <span className="shrink-0 text-[0.92rem] text-muted">
                    {t("price", { amount: formatAmount(item.priceAmd) })} · {t("minutes", { count: item.durationMinutes })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
        <div className="sticky-panel">
          <BookingPanel offerings={offerings} initialSlots={slots} />
        </div>
      </div>
    </PageStack>
  );
}
