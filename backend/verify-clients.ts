import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany({
    include: {
      hotel: true,
      createdBy: {
        select: { fullName: true, email: true },
      },
    },
    orderBy: { id: 'asc' },
  });

  console.log(`Total clients in database: ${clients.length}`);
  console.log('\nSample Clients (First 5):');
  clients.slice(0, 5).forEach((c) => {
    console.log(`- ID ${c.id}: ${c.fullName} (${c.nationality})`);
    console.log(`  Doc: ${c.documentNumber} | Email: ${c.email} | Tel: ${c.phone}`);
    console.log(`  Hotel: ${c.hotel?.name || 'N/A'} (Hab: ${c.roomNumber || 'N/A'})`);
    console.log(`  People: ${c.numberOfPeople} | Obs: ${c.observations}`);
    console.log(`  Status: ${c.status} | CreatedBy: ${c.createdBy.fullName}`);
    console.log('---');
  });

  const incomplete = clients.filter(
    (c) => !c.fullName || !c.documentNumber || !c.email || !c.phone || !c.nationality || !c.hotelId || !c.roomNumber
  );

  console.log(`Incomplete clients count: ${incomplete.length}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
