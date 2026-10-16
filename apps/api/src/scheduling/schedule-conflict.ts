/** PostgreSQL exclusion violations protect against concurrent day-off writes. */
export function isScheduleConflict(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error && error.code === "P2004") {
    return true;
  }
  const text = error instanceof Error ? error.message : "";
  return text.includes("23P01") || text.includes("ScheduleException_no_overlap");
}
