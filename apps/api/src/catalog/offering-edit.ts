import { AppError } from "../common/app-error";
import { intOf, recordOf, requiredString } from "../common/input";
import type { PrismaService } from "../infrastructure/prisma.service";

/** Updates the current offering. Existing visit prices stay on their own snapshot. */
export async function updateOffering(
  prisma: PrismaService,
  clinicId: string,
  offeringId: string,
  body: unknown,
): Promise<{ id: string }> {
  const existing = await prisma.serviceOffering.findFirst({
    where: { id: offeringId, clinicId },
    select: { id: true },
  });
  if (!existing) throw new AppError("NOT_FOUND", 404, "Ծառայությունը չի գտնվել");
  const input = recordOf(body);
  await prisma.serviceOffering.update({
    where: { id: existing.id },
    data: {
      name: capped(requiredString(input.name, "Ծառայություն"), 120),
      priceAmd: intOf(input.priceAmd, "Գին", 0, 100_000_000),
      durationMinutes: intOf(input.durationMinutes, "Տևողություն", 5, 24 * 60),
      isEstimate: input.isEstimate === true,
    },
  });
  return { id: existing.id };
}

function capped(text: string, max: number): string {
  if (text.length > max) throw new AppError("VALIDATION_FAILED", 400, "Տեքստը չափազանց երկար է");
  return text;
}
