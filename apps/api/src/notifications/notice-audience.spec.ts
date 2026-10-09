import { dropSuperAdmins } from "./notice-audience";

describe("dropSuperAdmins", () => {
  it("keeps patients, clinic admins, and doctors", () => {
    expect(dropSuperAdmins(["patient", "admin", "doctor"], [])).toEqual(["patient", "admin", "doctor"]);
  });

  it("removes a super admin even when they also appear as another recipient", () => {
    expect(dropSuperAdmins(["patient", "super", "patient"], ["super"])).toEqual(["patient"]);
  });
});
