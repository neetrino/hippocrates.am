import { doctorNameSearch, doctorSearchText } from "./doctor-search";

describe("doctorNameSearch", () => {
  it("matches official fields and every stored translation", () => {
    expect(doctorNameSearch("Orthodont")).toEqual([
      { user: { displayName: { contains: "Orthodont", mode: "insensitive" } } },
      { specialty: { contains: "Orthodont", mode: "insensitive" } },
      { bio: { contains: "Orthodont", mode: "insensitive" } },
      {
        locales: {
          some: {
            OR: [
              { name: { contains: "Orthodont", mode: "insensitive" } },
              { specialty: { contains: "Orthodont", mode: "insensitive" } },
              { bio: { contains: "Orthodont", mode: "insensitive" } },
            ],
          },
        },
      },
      {
        clinic: {
          OR: [
            { name: { contains: "Orthodont", mode: "insensitive" } },
            { district: { contains: "Orthodont", mode: "insensitive" } },
            {
              locales: {
                some: {
                  OR: [
                    { name: { contains: "Orthodont", mode: "insensitive" } },
                    { district: { contains: "Orthodont", mode: "insensitive" } },
                  ],
                },
              },
            },
          ],
        },
      },
    ]);
  });
});

describe("doctorSearchText", () => {
  it("collects Armenian, English, and Russian spellings", () => {
    expect(
      doctorSearchText({
        user: { displayName: "Մանե Սարգսյան" },
        specialty: "Օրթոդոնտ",
        bio: "Bio hy",
        locales: [{ name: "Mane Sargsyan", specialty: "Orthodontist", bio: "Bio en" }],
        clinic: {
          name: "Նաիրի Դենտ",
          district: "Կենտրոն",
          locales: [{ name: "Nairi Dent", district: "Kentron" }],
        },
      }),
    ).toEqual([
      "Մանե Սարգսյան",
      "Օրթոդոնտ",
      "Bio hy",
      "Նաիրի Դենտ",
      "Կենտրոն",
      "Mane Sargsyan",
      "Orthodontist",
      "Bio en",
      "Nairi Dent",
      "Kentron",
    ]);
  });
});
