type CardRow = {
  text: string;
  when: string;
  context: string;
  unread: boolean;
};

export function NoticeCard({
  row,
  selecting,
  checked,
  onToggle,
}: {
  row: CardRow;
  selecting: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  const body = (
    <span className="min-w-0">
      <span className="flex items-start gap-2">
        {row.unread ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" /> : null}
        <span>{row.text}</span>
      </span>
      {row.context ? <span className="mt-1 block text-sm text-ink/80">{row.context}</span> : null}
      <time className="mt-1 block text-sm text-muted">{row.when}</time>
    </span>
  );
  const className = `rounded-[1.1rem] border px-4 py-3.5 ${cardTone(row.unread, checked)}`;
  if (!selecting) return <article className={className}>{body}</article>;
  return (
    <label className={`${className} flex cursor-pointer items-start gap-3`}>
      <input type="checkbox" className="mt-1 size-4 shrink-0 accent-accent" checked={checked} onChange={onToggle} />
      {body}
    </label>
  );
}

export function NoticeMore({
  open,
  hidden,
  lessLabel,
  moreLabel,
  onToggle,
}: {
  open: boolean;
  hidden: number;
  lessLabel: string;
  moreLabel: string;
  onToggle: () => void;
}) {
  if (hidden <= 0) return null;
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/35 hover:text-accent"
      aria-expanded={open}
      onClick={onToggle}
    >
      {open ? lessLabel : moreLabel}
      <Chevron open={open} />
    </button>
  );
}

function cardTone(unread: boolean, checked: boolean): string {
  const edge = unread ? "border-l-4 border-l-accent" : "";
  if (checked) return `border-accent bg-accent-soft/70 ${edge}`;
  if (unread) return `border-line bg-accent-soft/70 ${edge}`;
  return "border-line bg-sand/70";
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${open ? "rotate-180" : ""}`} aria-hidden="true">
      <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
