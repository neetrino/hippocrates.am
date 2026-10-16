/** Page size for the signed-in notice list. The API caps this at 50. */
export const noticePageLimit = 20;

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

export type NoticePage = {
  items: NoticeItem[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadCount: number;
};

export const emptyNoticePage: NoticePage = { items: [], nextCursor: null, hasMore: false, unreadCount: 0 };

export function unreadNoticeCount(notices: { readAt: string | null }[]): number {
  return notices.filter((notice) => notice.readAt === null).length;
}
