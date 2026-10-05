import { getTranslations } from "next-intl/server";
import { VisitGroup, type VisitRow } from "@/features/portal/visit-group";
import { groupVisits, visitPreviewLimit } from "@/features/portal/visit-order";
import { clinicDisplayName, doctorDisplayName } from "@/shared/clinic-label";
import { asVisitStatus, formatAmount, formatTime, formatVisitDate } from "@/shared/format";
import { localizedServiceName, type ServiceMessageKey } from "@/shared/service-name";
import type { AppointmentCard } from "@/shared/public-types";

type Tone = keyof typeof visitPreviewLimit;

export async function VisitBoard({ visits, locale }: { visits: AppointmentCard[]; locale: string }) {
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const services = await getTranslations("services");
  const me = await getTranslations("me");
  if (visits.length === 0) {
    return <p className="m-0 rounded-[1.6rem] bg-white px-5 py-8 text-muted shadow-soft">{portal("emptyVisits")}</p>;
  }

  const groups = groupVisits(visits);
  const sections: { tone: Tone; title: string; items: AppointmentCard[] }[] = [
    { tone: "waiting", title: common("REQUESTED"), items: groups.waiting },
    { tone: "completed", title: common("COMPLETED"), items: groups.completed },
    { tone: "cancelled", title: common("CANCELLED"), items: groups.cancelled },
  ];

  return (
    <div className="grid gap-5">
      <p className="m-0 text-sm text-muted">{portal("sectionCount", { count: visits.length })}</p>
      {sections.map((section) =>
        section.items.length === 0 ? null : (
          <VisitGroup
            key={section.tone}
            tone={section.tone}
            title={section.title}
            visits={section.items.map((visit) => toRow(visit, locale, services, common))}
            moreLabel={me("showMore", { count: Math.max(section.items.length - visitPreviewLimit[section.tone], 0) })}
            lessLabel={me("showLess")}
          />
        ),
      )}
    </div>
  );
}

function toRow(
  visit: AppointmentCard,
  locale: string,
  services: (key: ServiceMessageKey) => string,
  common: (key: "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "price", values?: { amount: string }) => string,
): VisitRow {
  const status = asVisitStatus(visit.status);
  return {
    id: visit.id,
    status: visit.status,
    date: formatVisitDate(visit.startsAt, locale),
    time: formatTime(visit.startsAt),
    service: localizedServiceName(visit.offering.name, services),
    place: `${clinicDisplayName(visit.clinic, locale)} · ${doctorDisplayName(visit.doctor, locale)}`,
    statusLabel: status ? common(status) : visit.status,
    price: common("price", { amount: formatAmount(visit.priceAmd) }),
    needsReview: visit.status === "COMPLETED" && !visit.review,
  };
}
