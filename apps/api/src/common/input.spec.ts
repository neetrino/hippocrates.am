import { emailOf, passwordOf, requiredString } from "./input";

describe("input limits", () => {
  it("rejects oversized passwords before hashing", () => {
    expect(() => passwordOf("a".repeat(129))).toThrow(
      expect.objectContaining({ code: "VALIDATION_FAILED", status: 400 }),
    );
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
