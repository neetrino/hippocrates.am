export type ClinicCard = {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  description: string;
  coverUrl: string | null;
  logoUrl: string | null;
};

export type DoctorCard = {
  id: string;
  specialty: string;
  bio: string;
  photoUrl: string | null;
  user: { displayName: string };
  clinic: { id: string; name: string };
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
  priceAmd: number;
  isEstimate: boolean;
  offering: { name: string };
  clinic: { name: string; locales?: { locale: string; name: string }[] };
  doctor: { user: { displayName: string }; locales?: { locale: string; name: string }[] };
  patient: { displayName: string };
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
