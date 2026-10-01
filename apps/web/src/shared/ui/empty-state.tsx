export function EmptyState({ children }: { children: string }) {
  return (
    <p className="rounded-card border border-dashed border-line bg-white p-7 text-center text-muted">
      {children}
    </p>
  );
}
