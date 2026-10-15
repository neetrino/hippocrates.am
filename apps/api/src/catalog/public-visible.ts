/** Marketplace and booking require both visibility and an approved verification. */
const approvedVisibility = {
  published: true,
  verificationStatus: "APPROVED",
} as const;

export const liveListing = {
  ...approvedVisibility,
  archivedAt: null,
} as const;

export const liveDoctor = {
  ...approvedVisibility,
  clinic: liveListing,
} as const;

export const liveOffering = {
  published: true,
  doctor: liveDoctor,
  clinic: liveListing,
} as const;
