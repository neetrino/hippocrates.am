"use client";

import { useState } from "react";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { visitPreviewLimit } from "@/features/portal/visit-order";
import { ReviewForm } from "@/features/portal/review-form";
import { visitStatusClass } from "@/features/portal/visit-status-style";
import { asVisitStatus } from "@/shared/format";

type Tone = keyof typeof visitPreviewLimit;

const toneClass: Record<Tone, { band: string; count: string; rail: string }> = {
  waiting: {
    band: "bg-waiting text-waiting-ink",
    count: "bg-white/70 text-waiting-ink",
    rail: "border-l-waiting",
  },
  completed: {
    band: "bg-[#2a4a47] text-white",
    count: "bg-white/15 text-white",
    rail: "border-l-[#2a4a47]",
  },
  cancelled: {
    band: "bg-danger/10 text-danger",
    count: "bg-danger/10 text-danger",
    rail: "border-l-danger/45",
  },
};

export type VisitRow = {
  id: string;
  status: string;
  date: string;
  time: string;
  service: string;
  place: string;
  statusLabel: string;
  price: string;
  needsReview: boolean;
  startsAt: string;
};

export function VisitGroup({
  tone,
  title,
  visits,
  moreLabel,
  lessLabel,
}: {
  tone: Tone;
  title: string;
  visits: VisitRow[];
  moreLabel: string;
  lessLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const toneStyle = toneClass[tone];
  const hidden = visits.length - visitPreviewLimit[tone];
  const shown = open || hidden <= 0 ? visits : visits.slice(0, visitPreviewLimit[tone]);
  const quiet = tone === "cancelled";

  return (
    <section className={`overflow-hidden rounded-[1.6rem] bg-white shadow-soft ${tone === "cancelled" ? "ring-1 ring-danger/15" : ""}`}>
      <header className={`flex items-center justify-between px-5 py-4 ${toneStyle.band}`}>
        <h2 className="m-0 text-sm font-semibold">{title}</h2>
        <span className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-sm font-bold ${toneStyle.count}`}>{visits.length}</span>
      </header>
      <div className="grid gap-3 p-4">
        {shown.map((visit) => (
          <VisitCard key={visit.id} visit={visit} rail={toneStyle.rail} quiet={quiet} />
        ))}
        {hidden > 0 ? (
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/35 hover:text-accent"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? lessLabel : moreLabel}
            <Chevron open={open} />
          </button>
        ) : null}
      </div>
    </section>
  );
}

function VisitCard({ visit, rail, quiet }: { visit: VisitRow; rail: string; quiet: boolean }) {
  const status = asVisitStatus(visit.status);
  return (
    <article className={`grid gap-3 rounded-[1.15rem] border border-line border-l-4 bg-sand/70 px-4 py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start ${rail}`}>
      <div>
        <p className={`m-0 text-sm font-medium ${quiet ? "text-muted" : "text-ink/70"}`}>
          {visit.date}
        </p>
        <p className={`mt-1 mb-0 font-display text-[1.45rem] leading-none font-bold ${quiet ? "text-muted line-through decoration-danger/50" : "text-ink"}`}>
          {visit.time}
        </p>
      </div>
      <div className="grid min-w-0 gap-2">
        <strong className={quiet ? "text-muted" : "text-ink"}>{visit.service}</strong>
        <p className="m-0 text-sm text-muted">{visit.place}</p>
        <p className="m-0 flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status ? visitStatusClass[status] : "bg-sand text-ink"}`}>
            {visit.statusLabel}
          </span>
          <span className="text-xs text-muted">{visit.price}</span>
        </p>
        <AppointmentActions id={visit.id} status={visit.status} startsAt={visit.startsAt} mode="patient" />
        {visit.needsReview ? <ReviewForm appointmentId={visit.id} /> : null}
      </div>
    </article>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${open ? "rotate-180" : ""}`} aria-hidden="true">
      <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
