import { clinicDisplayName, doctorDisplayName } from "@/shared/clinic-label";
import { formatWhen, patientLabel } from "@/shared/format";
import type { NoticeItem } from "@/shared/notice";
import { noticeKind, noticeLine, type NoticeKind, type NoticeMessageKey } from "@/shared/notice-text";

export type NoticeAudience = "patient" | "doctor" | "clinic";

export type NoticeRow = {
  id: string;
  text: string;
  when: string;
  context: string;
  unread: boolean;
  startsAt: string | null;
  kind: NoticeKind;
  people: string[];
};

export function toNoticeRows(
  items: readonly NoticeItem[],
  locale: string,
  translate: (key: NoticeMessageKey) => string,
  arrivedLabel: string,
  audience: NoticeAudience,
): NoticeRow[] {
  return items.map((item) => toNoticeRow(item, locale, translate, arrivedLabel, audience));
}

/** One notice card. Clinic rows name the patient and the doctor; the other audiences name the other person. */
function toNoticeRow(
  notice: NoticeItem,
  locale: string,
  translate: (key: NoticeMessageKey) => string,
  arrivedLabel: string,
  audience: NoticeAudience,
): NoticeRow {
  const visit = notice.appointment;
  const patient = visit ? patientLabel(visit, locale) : "";
  const doctor = visit ? doctorDisplayName(visit.doctor, locale) : "";
  const person = audience === "doctor" ? patient : doctor;
  const people = audience === "clinic" ? [patient, doctor].filter(Boolean) : person ? [person] : [];
  return {
    id: notice.id,
    text: noticeLine(notice.body, notice.detail, translate),
    when: `${arrivedLabel} · ${formatWhen(notice.createdAt, locale)}`,
    context: noticeContext(visit, audience, patient, doctor, person, locale),
    unread: notice.readAt === null,
    startsAt: visit?.startsAt ?? null,
    kind: noticeKind(notice.body),
    people,
  };
}

function noticeContext(
  visit: NoticeItem["appointment"],
  audience: NoticeAudience,
  patient: string,
  doctor: string,
  person: string,
  locale: string,
): string {
  if (!visit) return "";
  const when = formatWhen(visit.startsAt, locale);
  if (audience === "clinic") return `${patient} · ${doctor} · ${when}`;
  return `${clinicDisplayName(visit.clinic, locale)} · ${person} · ${when}`;
}
