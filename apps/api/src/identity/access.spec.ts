import { requireClinicAdmin, requireRoles, type Actor } from "./access";

describe("registration access", () => {
  const admin: Actor = { id: "a", role: "ADMIN", clinicId: "clinic-1" };

  it("lets an admin register a doctor only for their clinic", () => {
    expect(() => requireClinicAdmin(admin, "clinic-1")).not.toThrow();
  });

  it("hides another clinic from an admin", () => {
    expect(() => requireClinicAdmin(admin, "clinic-2")).toThrow(
      expect.objectContaining({ code: "NOT_FOUND", status: 404 }),
    );
  });

  it("rejects a patient from clinic administration", () => {
    const patient: Actor = { id: "p", role: "PATIENT", clinicId: null };
    expect(() => requireRoles(patient, ["SUPER_ADMIN"])).toThrow(
      expect.objectContaining({ code: "FORBIDDEN" }),
    );
  });
});
