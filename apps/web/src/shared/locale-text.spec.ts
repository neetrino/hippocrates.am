import { describe, expect, it } from "vitest";
import { portalName, specialtyLabel } from "./clinic-label";
import { formatVisitDate, formatWhen } from "./format";

describe("portal names", () => {
  it("keeps a saved English doctor name and latinizes when none is saved", () => {
    expect(portalName("Անի Հակոբյան", "en", [{ locale: "en", name: "Ani Hakobyan" }])).toBe("Ani Hakobyan");
    expect(portalName("Պետրոս Երոյան", "en")).toBe("Petros Yeroyan");
    expect(portalName("Անի Հակոբյան", "hy")).toBe("Անի Հակոբյան");
    expect(portalName("Անի Հակոբյան", "ru", [{ locale: "ru", name: "Ани Акопян" }])).toBe("Ани Акопян");
  });

  it("uses a saved specialty before the known English wording", () => {
    expect(specialtyLabel("Թերապևտ", "en", [{ locale: "en", specialty: "Therapist" }])).toBe("Therapist");
    expect(specialtyLabel("general dentist", "en")).toBe("General dentist");
    expect(specialtyLabel("general dentist", "hy")).toBe("Ընդհանուր ատամնաբույժ");
  });
});

describe("Armenian dates", () => {
  it("formats a Yerevan day without relying on the browser hy-AM data", () => {
    expect(formatVisitDate("2026-10-20T08:46:00Z", "hy")).toBe("20 հոկ, 2026 թ.");
    expect(formatWhen("2026-10-20T08:46:00Z", "hy")).toBe("20 հոկ, 2026 թ., 12:46");
  });
});
