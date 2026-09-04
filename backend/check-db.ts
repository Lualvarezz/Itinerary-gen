import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany();
  console.log('Existing Clients:', clients);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
