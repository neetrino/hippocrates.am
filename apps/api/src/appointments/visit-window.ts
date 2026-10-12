export function visitHasStarted(startsAt: Date, now: Date): boolean {
  return startsAt.getTime() <= now.getTime();
}

export type ScheduleProposal = "PATIENT" | "STAFF";

/** A confirmed visit returns to a request. Staff proposals wait for the patient. */
export function rescheduleOutcome(
  byPatient: boolean,
  status: "REQUESTED" | "CONFIRMED",
): { status: "REQUESTED"; proposedBy: ScheduleProposal } {
  if (!byPatient && status === "CONFIRMED") return { status: "REQUESTED", proposedBy: "STAFF" };
  return { status: "REQUESTED", proposedBy: "PATIENT" };
}

export function staffMayConfirm(proposedBy: ScheduleProposal): boolean {
  return proposedBy !== "STAFF";
}

export function patientMayAccept(proposedBy: ScheduleProposal): boolean {
  return proposedBy === "STAFF";
}
