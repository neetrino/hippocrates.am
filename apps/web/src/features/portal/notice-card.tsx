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

export function NoticeLoadMore({
  label,
  pending,
  onLoad,
}: {
  label: string;
  pending: boolean;
  onLoad: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/35 hover:text-accent disabled:cursor-default disabled:opacity-60"
      disabled={pending}
      onClick={onLoad}
    >
      {label}
    </button>
  );
}

function cardTone(unread: boolean, checked: boolean): string {
  const edge = unread ? "border-l-4 border-l-accent" : "";
  if (checked) return `border-accent bg-accent-soft/70 ${edge}`;
  if (unread) return `border-line bg-accent-soft/70 ${edge}`;
  return "border-line bg-sand/70";
}
