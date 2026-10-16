export const MAIL_ATTEMPTS = 5;

/** Next status after one send attempt. */
export function nextMailAttempt(accepted: boolean, attempts: number): { status: "SENT" | "PENDING" | "FAILED"; attempts: number } {
  if (accepted) return { status: "SENT", attempts };
  const next = attempts + 1;
  return { status: next >= MAIL_ATTEMPTS ? "FAILED" : "PENDING", attempts: next };
}
