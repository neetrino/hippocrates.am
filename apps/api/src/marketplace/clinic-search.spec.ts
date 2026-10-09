import { clinicCopies, clinicNameSearch } from "./clinic-search";

describe("clinicNameSearch", () => {
  it("matches the official name and every stored translation", () => {
    expect(clinicNameSearch("Areg")).toEqual([
      { name: { contains: "Areg", mode: "insensitive" } },
      { locales: { some: { name: { contains: "Areg", mode: "insensitive" } } } },
    ]);
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
