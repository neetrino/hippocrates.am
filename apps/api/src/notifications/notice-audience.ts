/** Visit notices go to the patient, clinic admin, and doctor. Super Admin is never a recipient. */
export function dropSuperAdmins(userIds: readonly string[], superAdminIds: readonly string[]): string[] {
  const skip = new Set(superAdminIds);
  return [...new Set(userIds)].filter((id) => !skip.has(id));
}
