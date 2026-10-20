import { verificationLink } from "./email-verify-link";
import { resetLocale } from "./password-link";

describe("email verification link", () => {
  const previous = process.env.WEB_URL;

  afterEach(() => {
    process.env.WEB_URL = previous;
  });

  it("builds a locale link without putting the token in the path", () => {
    process.env.WEB_URL = "http://localhost:3000/";
    expect(resetLocale("en")).toBe("en");
    expect(verificationLink("abc", "hy")).toBe("http://localhost:3000/verify-email?token=abc");
    expect(verificationLink("a b", "ru")).toBe("http://localhost:3000/ru/verify-email?token=a%20b");
  });
});
