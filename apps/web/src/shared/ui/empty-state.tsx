export function EmptyState({ children }: { children: string }) {
  return (
    <p className="rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center text-[0.98rem] text-muted">
      {children}
    </p>
  );
}
