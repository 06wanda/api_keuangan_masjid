const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const semuaMasjid = await prisma.masjid.findMany();
  console.log(semuaMasjid);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
