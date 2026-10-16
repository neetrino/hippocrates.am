import { noticeLetter, noticesHref } from "./notice-letter";

describe("noticeLetter", () => {
  const startsAt = new Date("2026-10-16T08:00:00.000Z");

  it("uses the Armenian sentence, the visit, and the notices link", () => {
    const letter = noticeLetter({
      body: "notice.confirmed",
      detail: "  ",
      clinic: "Արև",
      doctor: "Անի",
      startsAt,
      href: "http://localhost:3000/me/notices",
    });
    expect(letter.subject).toBe("Ամրագրումը հաստատված է");
    expect(letter.text).toContain("Արև · Անի ·");
    expect(letter.text).toContain("http://localhost:3000/me/notices");
    expect(letter.text).not.toContain("—");
  });

  it("appends a short reason when the notice stored one", () => {
    const letter = noticeLetter({
      body: "notice.cancelledByClinic",
      detail: "Բժիշկը բացակա է",
      clinic: "",
      doctor: "",
      startsAt: null,
      href: "",
    });
    expect(letter.text).toBe("Կլինիկան չեղարկել է այցը — Բժիշկը բացակա է");
  });
});

describe("noticesHref", () => {
  const previous = process.env.WEB_URL;

  afterEach(() => {
    process.env.WEB_URL = previous;
  });

  it("sends clinic admins to the clinic list and everyone else to their own", () => {
    process.env.WEB_URL = "http://localhost:3000/";
    expect(noticesHref("ADMIN")).toBe("http://localhost:3000/clinic/notices");
    expect(noticesHref("PATIENT")).toBe("http://localhost:3000/me/notices");
  });
});
