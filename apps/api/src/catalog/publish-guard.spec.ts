import { AppError } from "../common/app-error";
import { assertCanPublish } from "./publish-guard";

describe("assertCanPublish", () => {
  it("allows hiding and approved publishing", () => {
    expect(() => assertCanPublish("DRAFT", false)).not.toThrow();
    expect(() => assertCanPublish("APPROVED", true)).not.toThrow();
  });

  it("blocks publishing before approval", () => {
    expect(() => assertCanPublish("SUBMITTED", true)).toThrow(AppError);
  });
});
