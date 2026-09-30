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
  const doctors = await prisma.doctorProfile.findMany({
    where: { published: true, clinic: { published: true } },
    orderBy: { user: { displayName: "asc" } },
    take: 12,
    select: {
      id: true,
      specialty: true,
      bio: true,
      photoKey: true,
      user: { select: { displayName: true } },
      clinic: { select: { id: true, name: true } },
    },
  });
  console.log(JSON.stringify({ doctors: doctors.length, photo: Boolean(doctors[0]?.photoKey) }));
} catch (error) {
  console.error(error instanceof Error ? error.message : "query failed");
} finally {
  await prisma.$disconnect();
}
