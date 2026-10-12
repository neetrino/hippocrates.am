import { resetLink, resetLocale } from "./password-mail";

describe("password reset mail", () => {
  const previous = process.env.WEB_URL;

  afterEach(() => {
    process.env.WEB_URL = previous;
  });

  it("builds a locale link without putting the token in the path", () => {
    process.env.WEB_URL = "http://localhost:3000/";
    expect(resetLocale("en")).toBe("en");
    expect(resetLocale("hy")).toBe("hy");
    expect(resetLink("abc", "hy")).toBe("http://localhost:3000/reset-password?token=abc");
    expect(resetLink("a b", "ru")).toBe("http://localhost:3000/ru/reset-password?token=a%20b");
  });
});
