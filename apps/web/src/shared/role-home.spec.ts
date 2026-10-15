import { describe, expect, it } from "vitest";
import { accountHome } from "./role-home";

describe("accountHome", () => {
  it.each([
    ["SUPER_ADMIN", "/super-admin"],
    ["ADMIN", "/clinic"],
    ["DOCTOR", "/me"],
    ["PATIENT", "/me"],
  ])("routes %s to %s", (role, expected) => {
    expect(accountHome(role)).toBe(expected);
  });
});
