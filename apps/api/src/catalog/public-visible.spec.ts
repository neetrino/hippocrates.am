import { liveDoctor, liveListing, liveOffering } from "./public-visible";

describe("liveListing", () => {
  it("requires published and approved verification", () => {
    expect(liveListing).toEqual({ published: true, verificationStatus: "APPROVED", archivedAt: null });
    expect(liveDoctor.clinic).toEqual(liveListing);
    expect(liveOffering.doctor).toEqual(liveDoctor);
    expect(liveOffering.clinic).toEqual(liveListing);
  });
});
