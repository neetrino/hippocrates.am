import { emailOf, passwordOf, requiredString } from "./input";

describe("input limits", () => {
  it("rejects oversized passwords before hashing", () => {
    expect(() => passwordOf("a".repeat(129))).toThrow(
      expect.objectContaining({ code: "VALIDATION_FAILED", status: 400 }),
    );
  });

  it("accepts a new password with a letter and a digit", () => {
    expect(passwordOf("river123")).toBe("river123");
  });

  it("rejects a new password without a letter or a digit", () => {
    expect(() => passwordOf("abcdefgh")).toThrow(expect.objectContaining({ code: "VALIDATION_FAILED" }));
    expect(() => passwordOf("123456789")).toThrow(expect.objectContaining({ code: "VALIDATION_FAILED" }));
  });

  it("rejects a common password and one equal to the email", () => {
    expect(() => passwordOf("qwerty123")).toThrow(expect.objectContaining({ code: "VALIDATION_FAILED" }));
    expect(() => passwordOf("Mail12box", "mail12box")).toThrow(expect.objectContaining({ code: "VALIDATION_FAILED" }));
  });

  it("rejects oversized email addresses", () => {
    expect(() => emailOf(`${"a".repeat(250)}@example.test`)).toThrow(
      expect.objectContaining({ code: "VALIDATION_FAILED", status: 400 }),
    );
  });

  it("applies field-specific text bounds", () => {
    expect(() => requiredString("abcd", "Field", 3)).toThrow(
      expect.objectContaining({ code: "VALIDATION_FAILED", status: 400 }),
    );
  });
});
