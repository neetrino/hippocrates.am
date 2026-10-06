import type { VisitStatus } from "@/shared/format";

export const visitStatusClass: Record<VisitStatus, string> = {
  REQUESTED: "bg-waiting text-waiting-ink",
  CONFIRMED: "bg-accent text-white",
  COMPLETED: "bg-ink text-white",
  CANCELLED: "bg-danger/10 text-danger",
};
