import { PrismaClient, ResourceType } from "@prisma/client";
const prisma = new PrismaClient();

await prisma.hospital.upsert({
  where: { id: 1 }, update: {},
  create: { id: 1, name: "Demo City Hospital", city: "Delhi", state: "Delhi", address: "Central Delhi", phone: "011-00000000", resources: { create: [
    { type: ResourceType.GENERAL_BED, total: 100, occupied: 72 },
    { type: ResourceType.ICU_BED, total: 20, occupied: 14 },
    { type: ResourceType.VENTILATOR, total: 10, occupied: 6 }
  ] } }
});
await prisma.$disconnect();
