import { clinicCopies, clinicNameSearch, clinicNameSpellings, filterClinicsByName, matchesClinicName } from "./clinic-search";

describe("clinicNameSearch", () => {
  it("matches the official name and every stored translation", () => {
    expect(clinicNameSearch("Areg")).toEqual([
      { name: { contains: "Areg", mode: "insensitive" } },
      { locales: { some: { name: { contains: "Areg", mode: "insensitive" } } } },
    ]);
  });
});

const aregSpellings = ["Արեգ Ստոմատոլոգիա", "Areg Stomatology"];

describe("clinicNameSpellings", () => {
  it("collects Armenian and translated names", () => {
    expect(
      clinicNameSpellings({
        name: "Արեգ Ստոմատոլոգիա",
        locales: [{ name: "Areg Stomatology" }, { name: "Арег Стоматология" }],
      }),
    ).toEqual(["Արեգ Ստոմատոլոգիա", "Areg Stomatology", "Арег Стоматология"]);
  });
});

describe("matchesClinicName", () => {
  it("matches a name prefix in any language", () => {
    expect(matchesClinicName(aregSpellings, "Ար")).toBe(true);
    expect(matchesClinicName(aregSpellings, "Are")).toBe(true);
  });

  it("rejects letters from the middle of a name", () => {
    expect(matchesClinicName(aregSpellings, "եգ")).toBe(false);
  });

  it("rejects address or district text that is not part of the name", () => {
    expect(matchesClinicName(aregSpellings, "Kentron")).toBe(false);
  });
});

describe("filterClinicsByName", () => {
  const rows = [
    { name: "Արեգ Ստոմատոլոգիա", locales: [{ name: "Areg Stomatology" }] },
    { name: "Նաիրի Դենտ", locales: [{ name: "Nairi Dent" }] },
  ];

  it("keeps only prefix matches", () => {
    expect(filterClinicsByName(rows, "Nai").map((row) => row.name)).toEqual(["Նաիրի Դենտ"]);
  });
});

describe("clinicCopies", () => {
  it("keeps the Armenian spelling beside the translations", () => {
    expect(
      clinicCopies({
        name: "Արեգ",
        district: "Կենտրոն",
        address: "Աբովյան 18",
        locales: [
          { name: "Areg", district: "Kentron", address: "Abovyan 18" },
          { name: "Арег", district: "Кентрон", address: "Абовяна 18" },
        ],
      }),
    ).toEqual([
      { name: "Արեգ", district: "Կենտրոն", address: "Աբովյան 18" },
      { name: "Areg", district: "Kentron", address: "Abovyan 18" },
      { name: "Арег", district: "Кентрон", address: "Абовяна 18" },
    ]);
  });
});
