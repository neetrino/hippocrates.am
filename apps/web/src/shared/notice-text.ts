const noticeMessages = {
  "notice.requested": "noticeRequested",
  "notice.confirmed": "noticeConfirmed",
  "notice.cancelled": "noticeCancelled",
  "notice.rescheduled": "noticeRescheduled",
  "notice.completed": "noticeCompleted",
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
