import { doctorNameSearch, doctorNameSpellings, filterDoctorsByName, matchesDoctorName } from "./doctor-search";

const maneSpellings = ["Մանե Սարգսյան", "Mane Sargsyan"];

describe("doctorNameSearch", () => {
  it("looks only in official and translated names", () => {
    expect(doctorNameSearch("Sar")).toEqual([
      { user: { displayName: { contains: "Sar", mode: "insensitive" } } },
      { locales: { some: { name: { contains: "Sar", mode: "insensitive" } } } },
    ]);
  });
});

describe("doctorNameSpellings", () => {
  it("collects Armenian and translated names", () => {
    expect(
      doctorNameSpellings({
        user: { displayName: "Մանե Սարգսյան" },
        locales: [{ name: "Mane Sargsyan" }, { name: "Мане Саргсян" }],
      }),
    ).toEqual(["Մանե Սարգսյան", "Mane Sargsyan", "Мане Саргсян"]);
  });
});

describe("matchesDoctorName", () => {
  it("matches a given-name prefix in any language", () => {
    expect(matchesDoctorName(maneSpellings, "Մա")).toBe(true);
    expect(matchesDoctorName(maneSpellings, "Ma")).toBe(true);
  });

  it("matches a family-name prefix", () => {
    expect(matchesDoctorName(maneSpellings, "Սար")).toBe(true);
    expect(matchesDoctorName(maneSpellings, "Sar")).toBe(true);
  });

  it("rejects letters from the middle of a name", () => {
    expect(matchesDoctorName(maneSpellings, "ան")).toBe(false);
  });

  it("rejects specialty text that is not part of the name", () => {
    expect(matchesDoctorName(maneSpellings, "Orth")).toBe(false);
  });

  it("requires every query word to match a name word", () => {
    expect(matchesDoctorName(maneSpellings, "Մանե Սար")).toBe(true);
    expect(matchesDoctorName(maneSpellings, "Մանե Dent")).toBe(false);
  });
});

describe("filterDoctorsByName", () => {
  const rows = [
    { user: { displayName: "Մանե Սարգսյան" }, locales: [{ name: "Mane Sargsyan" }] },
    { user: { displayName: "Լևոն Ավետիսյան" }, locales: [{ name: "Levon Avetisyan" }] },
  ];

  it("keeps only prefix matches", () => {
    expect(filterDoctorsByName(rows, "Sar").map((row) => row.user.displayName)).toEqual(["Մանե Սարգսյան"]);
  });
});
