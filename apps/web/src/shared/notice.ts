/** Newest notices kept open before "More". */
export const noticePreviewLimit = 6;

/** Fired after the notices page marks the current list as read. */
export const noticesReadEvent = "hippocrates:notices-read";

export type NoticeItem = {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  appointment: {
    startsAt: string;
    patient: { displayName: string };
    clinic: { name: string; locales?: { locale: string; name: string }[] };
    doctor: { user: { displayName: string }; locales?: { locale: string; name: string }[] };
  } | null;
};

export function unreadNoticeCount(notices: { readAt: string | null }[]): number {
  return notices.filter((notice) => notice.readAt === null).length;
}
