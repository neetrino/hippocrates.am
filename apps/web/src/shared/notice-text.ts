const noticeMessages = {
  "notice.requested": "noticeRequested",
  "notice.confirmed": "noticeConfirmed",
  "notice.cancelled": "noticeCancelled",
  "notice.cancelledByPatient": "noticeCancelledByPatient",
  "notice.cancelledByDoctor": "noticeCancelledByDoctor",
  "notice.cancelledByClinic": "noticeCancelledByClinic",
  "notice.expired": "noticeExpired",
  "notice.rescheduled": "noticeRescheduled",
  "notice.rescheduledByPatient": "noticeRescheduledByPatient",
  "notice.rescheduledByDoctor": "noticeRescheduledByDoctor",
  "notice.rescheduledByClinic": "noticeRescheduledByClinic",
  "notice.noShow": "noticeNoShow",
  "notice.deskBooked": "noticeDeskBooked",
  "notice.completed": "noticeCompleted",
  "notice.reminderDay": "noticeReminderDay",
  "notice.reminderHour": "noticeReminderHour",
  "Նոր ամրագրման հայտ": "noticeRequested",
  "Ամրագրումը հաստատված է": "noticeConfirmed",
  "Ամրագրումը չեղարկված է": "noticeCancelled",
  "Ամրագրումը տեղափոխված է": "noticeRescheduled",
  "Այցն ավարտված է": "noticeCompleted",
} as const;

export type NoticeMessageKey = (typeof noticeMessages)[keyof typeof noticeMessages];

/** System notices are stored as a stable key. Older rows keep the Armenian sentence. */
export function noticeMessageKey(body: string): NoticeMessageKey | null {
  if (Object.prototype.hasOwnProperty.call(noticeMessages, body)) {
    return noticeMessages[body as keyof typeof noticeMessages];
  }
  return null;
}

/** Appends a short reason when the visit notice stored one. */
export function noticeLine(body: string, detail: string | null | undefined, translate: (key: NoticeMessageKey) => string): string {
  const key = noticeMessageKey(body);
  const text = key ? translate(key) : body;
  const reason = detail?.trim();
  return reason ? `${text} — ${reason}` : text;
}
