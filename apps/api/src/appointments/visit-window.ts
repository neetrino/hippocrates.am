export function visitHasStarted(startsAt: Date, now: Date): boolean {
  return startsAt.getTime() <= now.getTime();
}

export type ScheduleProposal = "PATIENT" | "STAFF";

/** A confirmed visit on an account returns to a request. A phone guest stays confirmed. */
export function rescheduleOutcome(
  byPatient: boolean,
  status: "REQUESTED" | "CONFIRMED",
  linked: boolean,
): { status: "REQUESTED" | "CONFIRMED"; proposedBy: ScheduleProposal } {
  if (!byPatient && status === "CONFIRMED" && linked) return { status: "REQUESTED", proposedBy: "STAFF" };
  if (!byPatient && status === "CONFIRMED") return { status: "CONFIRMED", proposedBy: "STAFF" };
  return { status: "REQUESTED", proposedBy: "PATIENT" };
}

export function staffMayConfirm(proposedBy: ScheduleProposal): boolean {
  return proposedBy !== "STAFF";
}

export function patientMayAccept(proposedBy: ScheduleProposal): boolean {
  return proposedBy === "STAFF";
}
