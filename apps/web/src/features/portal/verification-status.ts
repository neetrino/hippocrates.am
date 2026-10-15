export type VerificationStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type VerificationKind = "clinic" | "doctor";
export type VerificationDecision = "APPROVE" | "REJECT" | "SUSPEND";

export type VerificationClinic = {
  id: string;
  kind: "clinic";
  name: string;
  detail: string;
  status: VerificationStatus;
  published: boolean;
};

export type VerificationDoctor = {
  id: string;
  kind: "doctor";
  name: string;
  detail: string;
  clinicName: string;
  clinicId: string;
  status: VerificationStatus;
  published: boolean;
};

export type VerificationQueue = {
  clinics: VerificationClinic[];
  doctors: VerificationDoctor[];
};

export function isApproved(status: string | undefined): boolean {
  return status === "APPROVED";
}

export function statusChipClass(status: string): string {
  if (status === "APPROVED") return "bg-accent-soft text-accent";
  if (status === "REJECTED" || status === "SUSPENDED") return "bg-sand text-muted";
  return "bg-[#2a4a47]/8 text-[#2a4a47]";
}
