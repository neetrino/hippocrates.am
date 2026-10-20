import { AppError } from "../common/app-error";
import { patientBookingOpen, patientChangeOpen, type PlatformRules } from "./platform-rules";

export function assertPatientMayBook(rules: PlatformRules, startsAt: Date, timeZone: string, now: Date): void {
  const verdict = patientBookingOpen(rules, startsAt, timeZone, now);
  if (verdict === "closed") throw new AppError("BOOKING_CLOSED", 403, "Ամրագրումը ժամանակավորապես փակ է");
  if (verdict === "too-far") throw new AppError("BOOKING_TOO_FAR", 409, "Այդ օրը դեռ բաց չէ ամրագրման համար");
  if (verdict === "too-soon") throw new AppError("BOOKING_TOO_SOON", 409, "Այս ժամը շատ մոտ է");
}

export function assertPatientDeadline(
  rules: PlatformRules,
  startsAt: Date,
  kind: "cancel" | "reschedule",
  now: Date,
): void {
  const minutes = kind === "cancel" ? rules.cancelDeadlineMinutes : rules.rescheduleDeadlineMinutes;
  if (patientChangeOpen(startsAt, now, minutes)) return;
  const message = kind === "cancel" ? "Չեղարկման ժամանակն անցել է" : "Տեղափոխման ժամանակն անցել է";
  const code = kind === "cancel" ? "CANCEL_DEADLINE" : "RESCHEDULE_DEADLINE";
  throw new AppError(code, 409, message);
}
