import type { ReactNode } from "react";
import { cn } from "@/shared/ui/cn";

export function PageFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("page-shell", className)}>{children}</div>;
}

export function PageStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("page-shell grid gap-5 pt-8 pb-10 max-md:gap-4 max-md:pt-5", className)}>{children}</div>;
}
