"use client";

import { useEffect, useState } from "react";
import { noticesReadEvent } from "@/shared/notice";

/** Unread in-app notices for the signed-in account. */
export function useUnreadNotices(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let ignore = false;
    void fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me/notifications`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { data?: { unreadCount?: number } } | null) => {
        if (ignore || typeof body?.data?.unreadCount !== "number") return;
        setCount(body.data.unreadCount);
      })
      .catch(() => undefined);
    function onRead(): void {
      ignore = true;
      setCount(0);
    }
    window.addEventListener(noticesReadEvent, onRead);
    return () => {
      ignore = true;
      window.removeEventListener(noticesReadEvent, onRead);
    };
  }, []);
  return count;
}
