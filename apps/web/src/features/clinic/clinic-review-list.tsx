"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
export type ClinicReview = {
  id: string;
  rating: number;
  body: string;
  reply: string | null;
  createdAt: string;
  when: string;
};

export function ClinicReviewList({ reviews }: { reviews: ClinicReview[] }) {
  const t = useTranslations("desk");
  if (reviews.length === 0) return <p className="m-0 text-muted">{t("noReviews")}</p>;
  return (
    <div className="grid gap-3">
      {reviews.map((review) => (
        <article className="grid gap-2 rounded-[14px] border border-line bg-white px-4 py-3.5" key={review.id}>
          <div className="flex items-center justify-between gap-3">
            <strong>{review.rating}/5</strong>
            <time className="text-sm text-muted" dateTime={review.createdAt}>{review.when}</time>
          </div>
          <p className="m-0">{review.body}</p>
          {review.reply ? <p className="m-0 text-muted">{review.reply}</p> : <ReplyForm id={review.id} />}
        </article>
      ))}
    </div>
  );
}

function ReplyForm({ id }: { id: string }) {
  const t = useTranslations("desk");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${id}/reply`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reply: String(form.get("reply") ?? "") }),
    });
    if (response.ok) window.location.reload();
    else setMessage(t("replyFailed"));
  }

  return (
    <form className="grid gap-2" onSubmit={(event) => void onSubmit(event)}>
      <label className="grid gap-1.5 text-[0.92rem] font-semibold">
        {t("reply")}
        <textarea name="reply" required rows={3} className="rounded-xl border border-line px-3.5 py-3 font-normal" />
      </label>
      <button className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-4 py-2.5 text-sm font-semibold text-white" type="submit">{t("sendReply")}</button>
      {message ? <p className="m-0 text-sm text-danger">{message}</p> : null}
    </form>
  );
}
