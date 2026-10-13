import { MAIN_BRANCH_NAME } from "./branch-edit";
import { recordOf, requiredPhoneOf } from "../common/input";
import type { PrismaService } from "../infrastructure/prisma.service";

/** Updates clinic identity and keeps the main branch address in sync. */
export async function updateClinicProfile(
  prisma: PrismaService,
  clinicId: string,
  body: unknown,
): Promise<{ id: string }> {
  const input = recordOf(body);
  const address = typeof input.address === "string" ? input.address.trim() : undefined;
  await prisma.$transaction(async (tx) => {
    await tx.clinic.update({
      where: { id: clinicId },
      data: {
        name: typeof input.name === "string" ? input.name.trim() : undefined,
        description: typeof input.description === "string" ? input.description.trim() : undefined,
        address,
        phone: typeof input.phone === "string" ? requiredPhoneOf(input.phone) : undefined,
        district: typeof input.district === "string" ? input.district.trim() : undefined,
        published: typeof input.published === "boolean" ? input.published : undefined,
      },
    });
    if (address === undefined) return;
    const main = await tx.branch.findFirst({ where: { clinicId, name: MAIN_BRANCH_NAME }, select: { id: true } });
    if (main) {
      await tx.branch.update({ where: { id: main.id }, data: { address } });
      return;
    }
    await tx.branch.create({ data: { clinicId, name: MAIN_BRANCH_NAME, address } });
  });
  return { id: clinicId };
}
