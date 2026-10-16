import type { Prisma } from "../generated/prisma/client";
import type { PrismaService } from "../infrastructure/prisma.service";
import { noticeListWhere, sliceNoticePage, type NoticeCursor } from "./notice-page";

const noticeSelect = {
  id: true,
  body: true,
  detail: true,
  createdAt: true,
  readAt: true,
  appointment: {
    select: {
      startsAt: true,
      guestName: true,
      patient: { select: { displayName: true } },
      clinic: { select: { name: true, locales: { select: { locale: true, name: true } } } },
      doctor: {
        select: {
          user: { select: { displayName: true } },
          locales: { select: { locale: true, name: true } },
        },
      },
    },
  },
} as const satisfies Prisma.NotificationSelect;

type NoticeRow = Prisma.NotificationGetPayload<{ select: typeof noticeSelect }>;

export type NoticeListPage = {
  items: NoticeRow[];
  nextCursor: string | null;
  hasMore: boolean;
  unreadCount: number;
};

/** Newest notices for one user. `unreadCount` is the full unread total, not this page. */
export async function listUserNotices(
  prisma: PrismaService,
  userId: string,
  limit: number,
  cursor: NoticeCursor | null,
): Promise<NoticeListPage> {
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: noticeListWhere(userId, cursor),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      select: noticeSelect,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return { ...sliceNoticePage(rows, limit), unreadCount };
}
