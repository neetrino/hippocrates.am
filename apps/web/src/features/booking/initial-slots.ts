import { publicGet } from "@/shared/public-api";
import type { OfferingCard } from "@/shared/public-types";

export type TimeSlot = { startsAt: string; busy: boolean };

export function todayInYerevan(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" }).format(new Date());
}

export async function initialSlots(offering: OfferingCard | undefined): Promise<TimeSlot[]> {
  if (!offering) return [];
  const params = new URLSearchParams({
    doctorId: offering.doctorId,
    offeringId: offering.id,
    date: todayInYerevan(),
  });
  try {
    const data = await publicGet<{ startsAt: string[]; slots?: TimeSlot[] }>(`/public/availability?${params}`);
    if (data.slots) return data.slots;
    return data.startsAt.map((startsAt) => ({ startsAt, busy: false }));
  } catch {
    return [];
  }
}
