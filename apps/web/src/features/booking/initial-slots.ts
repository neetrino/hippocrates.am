import { publicGet } from "@/shared/public-api";
import type { OfferingCard } from "@/shared/public-types";

export function todayInYerevan(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" }).format(new Date());
}

export async function initialSlots(offering: OfferingCard | undefined): Promise<string[]> {
  if (!offering) return [];
  const params = new URLSearchParams({
    doctorId: offering.doctorId,
    offeringId: offering.id,
    date: todayInYerevan(),
  });
  try {
    const data = await publicGet<{ startsAt: string[] }>(`/public/availability?${params}`);
    return data.startsAt;
  } catch {
    return [];
  }
}
