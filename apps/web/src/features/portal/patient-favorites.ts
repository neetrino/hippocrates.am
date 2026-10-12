import { getMe, sessionGet } from "@/shared/session-api";
import type { ClinicCard, DoctorCard } from "@/shared/public-types";

export type FavoriteSet = {
  clinicIds: string[];
  doctorIds: string[];
};

type FavoritePayload = {
  clinics: ClinicCard[];
  doctors: DoctorCard[];
};

/** Hearts for guests and patients. Clinic staff browsing the catalog see none. */
export async function loadFavoriteSet(locale: string): Promise<FavoriteSet | null> {
  const me = await getMe();
  if (me && me.role !== "PATIENT") return null;
  if (!me) return { clinicIds: [], doctorIds: [] };
  const query = locale === "hy" ? "" : `?locale=${locale}`;
  const data = await sessionGet<FavoritePayload>(`/favorites${query}`);
  return {
    clinicIds: data?.clinics.map((clinic) => clinic.id) ?? [],
    doctorIds: data?.doctors.map((doctor) => doctor.id) ?? [],
  };
}

export async function loadFavoriteCards(locale: string): Promise<FavoritePayload> {
  const query = locale === "hy" ? "" : `?locale=${locale}`;
  const data = await sessionGet<FavoritePayload>(`/favorites${query}`);
  return { clinics: data?.clinics ?? [], doctors: data?.doctors ?? [] };
}
