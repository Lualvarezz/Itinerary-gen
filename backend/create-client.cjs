const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  await prisma.client.createMany({
    data: [{
      id: 1,
      fullName: 'María Fernanda López',
      documentNumber: '1010101010',
      email: 'maria@example.com',
      phone: '3001234567',
      nationality: 'Colombiana',
      numberOfPeople: 2,
      observations: 'Cliente frecuente',
      createdByUserId: '11111111-1111-1111-1111-111111111111',
      status: 'active',
    }],
    skipDuplicates: true,
  });
  console.log('client ready');
  await prisma.$disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
