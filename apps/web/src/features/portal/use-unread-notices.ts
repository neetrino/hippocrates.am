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
      .then((body: { data?: { readAt: string | null }[] } | null) => {
        if (ignore || !body?.data) return;
        setCount(body.data.filter((item) => item.readAt === null).length);
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
