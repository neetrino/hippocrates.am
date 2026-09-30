import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const env = {};
for (const line of readFileSync(new URL("../../../.env", import.meta.url), "utf8").split(/\n/)) {
  const eq = line.indexOf("=");
  if (eq < 1 || line.startsWith("#")) continue;
  const key = line.slice(0, eq).trim();
  let value = line.slice(eq + 1).trim();
  if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
  env[key] = value;
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });
try {
  const clinics = await prisma.clinic.findMany({
    take: 3,
    select: { name: true, district: true, coverKey: true },
  });
  const doctors = await prisma.doctorProfile.count();
  console.log(JSON.stringify({ clinics: clinics.map((item) => ({ name: item.name, district: item.district, hasCover: Boolean(item.coverKey) })), doctors }));
} catch (error) {
  console.error(error instanceof Error ? error.message : "query failed");
} finally {
  await prisma.$disconnect();
}
