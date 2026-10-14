/** Marketplace and booking require both visibility and an approved verification. */
export const liveListing = {
  published: true,
  verificationStatus: "APPROVED",
} as const;

export const liveDoctor = {
  ...liveListing,
  clinic: liveListing,
} as const;

export const liveOffering = {
  published: true,
  doctor: liveListing,
  clinic: liveListing,
} as const;
