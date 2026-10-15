/** Newest notices kept open before "More". */
export const noticePreviewLimit = 6;

/** Fired after the notices page marks the current list as read. */
export const noticesReadEvent = "hippocrates:notices-read";

export type NoticeItem = {
  id: string;
  body: string;
  detail?: string | null;
  createdAt: string;
  readAt: string | null;
  appointment: {
    startsAt: string;
    guestName?: string | null;
    patient: { displayName: string } | null;
    clinic: { name: string; locales?: { locale: string; name: string }[] };
    doctor: { user: { displayName: string }; locales?: { locale: string; name: string }[] };
  } | null;
};

export function unreadNoticeCount(notices: { readAt: string | null }[]): number {
  return notices.filter((notice) => notice.readAt === null).length;
}
