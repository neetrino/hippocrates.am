import { noticePageLimit, noticesReadEvent, type NoticePage } from "@/shared/notice";

const notificationsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/me/notifications`;

/** Next page of the signed-in user's notices. `cursor` comes from the previous page. */
export function fetchNoticePage(cursor: string): Promise<NoticePage | null> {
  const params = new URLSearchParams({ limit: String(noticePageLimit), cursor });
  return fetch(`${notificationsUrl}?${params}`, { credentials: "include" })
    .then(async (response) => {
      if (!response.ok) return null;
      const body = (await response.json()) as { data?: NoticePage };
      return body.data?.items ? body.data : null;
    })
    .catch(() => null);
}

/** Marks the signed-in user's unread notices read and clears the sidebar badge. */
export function markNoticesRead(): Promise<boolean> {
  return fetch(`${notificationsUrl}/read`, { method: "POST", credentials: "include" })
    .then((response) => {
      if (response.ok) window.dispatchEvent(new Event(noticesReadEvent));
      return response.ok;
    })
    .catch(() => false);
}

/** Deletes the given notices. Rows that belong to someone else are ignored. */
export function deleteNotices(ids: string[]): Promise<boolean> {
  return fetch(notificationsUrl, {
    method: "DELETE",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids }),
  })
    .then((response) => response.ok)
    .catch(() => false);
}

/** Deletes every read notice for the signed-in user. Unread rows stay. */
export function deleteReadNotices(): Promise<boolean> {
  return fetch(`${notificationsUrl}/read`, { method: "DELETE", credentials: "include" })
    .then((response) => response.ok)
    .catch(() => false);
}
