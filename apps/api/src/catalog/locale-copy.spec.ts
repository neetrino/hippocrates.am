import { applyClinic, applyDoctor } from "./locale-copy";
import { latinizeArmenian } from "./armenian-latin";

describe("english catalog fallback", () => {
  const clinic = {
    name: "Shams Dental Clinic",
    district: "Կենտրոն",
    address: "Բաբայան 18",
    description: "Նկարագրություն",
    branches: [{ name: "Հիմնական", address: "Բաբայան 18" }],
  };

  it("reads Armenian place names in Latin when English copy is missing", () => {
    expect(latinizeArmenian("Պետրոս Երոյան")).toBe("Petros Yeroyan");
    const shown = applyClinic(clinic, "en");
    expect(shown.district).toBe("Kentron");
    expect(shown.address).toBe("Babayan 18");
    expect(shown.name).toBe("Shams Dental Clinic");
    expect(shown.branches?.[0]?.address).toBe("Babayan 18");
  });

  it("keeps the Armenian source on the Armenian page and a saved English copy", () => {
    expect(applyClinic(clinic, null).address).toBe("Բաբայան 18");
    const saved = applyClinic({ ...clinic, locales: [{ locale: "en", name: "Shams", district: "Center", address: "Babayan Street 18", description: "" }] }, "en");
    expect(saved.address).toBe("Babayan Street 18");
    expect(saved.district).toBe("Center");
  });

  it("translates a known specialty and the doctor name", () => {
    const doctor = {
      specialty: "general dentist",
      bio: "",
      user: { displayName: "Պետրոս Երոյան" },
      clinic: { name: "Shams Dental Clinic" },
    };
    expect(applyDoctor(doctor, null).specialty).toBe("Ընդհանուր ատամնաբույժ");
    expect(applyDoctor(doctor, "en").user?.displayName).toBe("Petros Yeroyan");
    expect(applyDoctor(doctor, "en").specialty).toBe("General dentist");
  });
});
