import { prisma } from '../lib/prisma.js';

async function main() {
  console.log('Testing Client Creation...');
  const user = await prisma.user.findFirst();
  const userId = user?.id || '11111111-1111-1111-1111-111111111111';

  const client = await prisma.client.create({
    data: {
      fullName: 'Cliente de Prueba Automatizado',
      documentNumber: `DOC-${Date.now()}`,
      nationality: 'Colombiana',
      numberOfPeople: 3,
      status: 'active',
      createdByUserId: userId,
    },
  });

  console.log('Client created successfully:', client.id, client.fullName);
  await prisma.client.delete({ where: { id: client.id } });
  console.log('Test client deleted cleanly.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
