export function visitHasStarted(startsAt: Date, now: Date): boolean {
  return startsAt.getTime() <= now.getTime();
}

/** A patient move of an accepted visit waits for the clinic again. A clinic move keeps the current status. */
export function rescheduleStatus(byPatient: boolean, status: "REQUESTED" | "CONFIRMED"): "REQUESTED" | "CONFIRMED" {
  if (byPatient && status === "CONFIRMED") return "REQUESTED";
  return status;
}
