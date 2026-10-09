import type { ReactNode } from "react";
import { cn } from "@/shared/ui/cn";

export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4 max-md:items-start", className)}>
      <div className="grid min-w-0 gap-2">
        {eyebrow ? <p className="kicker">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
