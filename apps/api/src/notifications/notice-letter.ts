const yerevan = "Asia/Yerevan";

/** Armenian letter text. Accounts do not store a locale yet. */
const hyNotice: Record<string, string> = {
  "notice.requested": "Նոր ամրագրման հայտ",
  "notice.confirmed": "Ամրագրումը հաստատված է",
  "notice.cancelled": "Ամրագրումը չեղարկված է",
  "notice.cancelledByPatient": "Պացիենտը չեղարկել է այցը",
  "notice.cancelledByDoctor": "Բժիշկը չեղարկել է այցը",
  "notice.cancelledByClinic": "Կլինիկան չեղարկել է այցը",
  "notice.expired": "Կլինիկան չի պատասխանել, հայտը փակվել է",
  "notice.rescheduled": "Ամրագրումը տեղափոխված է",
  "notice.rescheduledByPatient": "Պացիենտն առաջարկում է նոր ժամ",
  "notice.rescheduledByDoctor": "Բժիշկն առաջարկում է նոր ժամ",
  "notice.rescheduledByClinic": "Կլինիկան առաջարկում է նոր ժամ",
  "notice.noShow": "Պացիենտը չի եկել",
  "notice.deskBooked": "Կլինիկան ամրագրել է այց",
  "notice.completed": "Այցն ավարտված է",
  "notice.reminderDay": "Այցը վաղն է",
  "notice.reminderHour": "Այցը մեկ ժամից է",
  "Նոր ամրագրման հայտ": "Նոր ամրագրման հայտ",
  "Ամրագրումը հաստատված է": "Ամրագրումը հաստատված է",
  "Ամրագրումը չեղարկված է": "Ամրագրումը չեղարկված է",
  "Ամրագրումը տեղափոխված է": "Ամրագրումը տեղափոխված է",
  "Այցն ավարտված է": "Այցն ավարտված է",
};

export type NoticeLetterInput = {
  body: string;
  detail: string | null;
  clinic: string;
  doctor: string;
  startsAt: Date | null;
  href: string;
};

/** Plain-text visit letter. The subject is the same sentence shown in the app. */
export function noticeLetter(input: NoticeLetterInput): { subject: string; text: string } {
  const subject = hyNotice[input.body] ?? input.body;
  const reason = input.detail?.trim();
  const line = reason ? `${subject} — ${reason}` : subject;
  const where = [input.clinic, input.doctor, input.startsAt ? formatVisitWhen(input.startsAt) : ""].filter(Boolean).join(" · ");
  const text = [line, where, input.href].filter(Boolean).join("\n\n");
  return { subject, text };
}

export function noticesHref(role: string): string {
  const base = (process.env.WEB_URL ?? "").replace(/\/$/, "");
  const path = role === "ADMIN" ? "/clinic/notices" : "/me/notices";
  return base ? `${base}${path}` : path;
}

function formatVisitWhen(startsAt: Date): string {
  return new Intl.DateTimeFormat("hy-AM", { dateStyle: "medium", timeStyle: "short", timeZone: yerevan }).format(startsAt);
}
