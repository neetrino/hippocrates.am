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
import { Photo } from "@/shared/ui/photo";

type DoctorPageData = DoctorCard & { offerings: OfferingCard[] };

export default async function DoctorPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = await params;
  const locale = prepareLocale(raw);
  const doctor = await publicGet<DoctorPageData>(`/public/doctors/${id}`, locale).catch(() => null);
  if (!doctor) notFound();
  const t = await getTranslations("common");
  const services = await getTranslations("services");
  const offerings = doctor.offerings.map((item) => ({ ...item, doctorId: doctor.id }));
  const slots = await initialSlots(offerings[0]);
  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-5 pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))] md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] md:items-start">
      <article className="overflow-hidden rounded-card border border-line bg-white shadow-soft">
        <div className="relative aspect-16/10 bg-sand">
          <Photo src={doctor.photoUrl} alt={doctor.user.displayName} />
        </div>
        <div className="grid gap-2 px-[18px] pt-4 pb-[18px]">
          <p className="mb-3 text-[0.78rem] font-semibold tracking-[0.08em] text-accent uppercase">{doctor.specialty}</p>
          <h1>{doctor.user.displayName}</h1>
          <p><Link href={`/clinics/${doctor.clinic.id}`}>{doctor.clinic.name}</Link></p>
          <p className="m-0 max-w-[42rem] text-lg leading-relaxed text-muted">{doctor.bio}</p>
          <div className="grid gap-3">
            {offerings.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5">
                <span>{localizedServiceName(item.name, services)}</span>
                <span>
                  {t("price", { amount: formatAmount(item.priceAmd) })} · {t("minutes", { count: item.durationMinutes })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </article>
      <BookingPanel offerings={offerings} initialSlots={slots} />
    </div>
  );
}
