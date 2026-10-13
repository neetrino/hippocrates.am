export type ClinicCopy = {
  name: string;
  district: string;
  address: string;
};

export type ClinicCard = {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  description: string;
  coverUrl: string | null;
  logoUrl: string | null;
  /** Official Armenian spelling plus every saved translation. Present on clinic lists. */
  copies?: ClinicCopy[];
};

export type DoctorCard = {
  id: string;
  specialty: string;
  bio: string;
  photoUrl: string | null;
  user: { displayName: string };
  clinic: { id: string; name: string };
  /** Official name plus every saved translation. Present on doctor lists. */
  nameSpellings?: string[];
};

export type OfferingCard = {
  id: string;
  name: string;
  priceAmd: number;
  isEstimate: boolean;
  durationMinutes: number;
  doctorId: string;
  doctor?: { user: { displayName: string } };
};

export type ReviewCard = {
  id: string;
  rating: number;
  body: string;
  reply: string | null;
  createdAt: string;
};

export type QuestionCard = {
  id: string;
  title: string;
  body: string;
  category: string;
  answers: { id: string; body: string; doctor: { specialty: string; user: { displayName: string } } }[];
};

export type AppointmentCard = {
  id: string;
  startsAt: string;
  status: string;
  proposedBy?: "PATIENT" | "STAFF";
  cancelReason?: string | null;
  priceAmd: number;
  isEstimate: boolean;
  offering: { id: string; name: string };
  clinic: { name: string; coverUrl?: string | null; locales?: { locale: string; name: string }[] };
  doctor: { id: string; user: { displayName: string }; locales?: { locale: string; name: string }[] };
  patient: { displayName: string } | null;
  guestName?: string | null;
  guestPhone?: string | null;
  review: { id: string } | null;
};

export type Me = {
  id: string;
  role: string;
  clinicId: string | null;
  displayName: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  emailVisitNotices: boolean;
};
