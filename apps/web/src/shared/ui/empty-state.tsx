import primitives from "@/shared/ui/primitives.module.css";

export function EmptyState({ children }: { children: string }) {
  return <p className={primitives.empty}>{children}</p>;
}
