import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApiData() {
  console.log('--- TESTING HOTELS & CLIENTS DB CONNECTION ---');

  const hotels = await prisma.hotel.findMany({ take: 20 });
  console.log(`Hotels found in DB: ${hotels.length}`);
  hotels.slice(0, 5).forEach((h) => {
    console.log(`- [Hotel ${h.id}] ${h.name} | Address: ${h.address} | Zone: ${h.zone}`);
  });

  const clients = await prisma.client.findMany({
    take: 5,
    include: { hotel: true },
  });
  console.log(`\nSample Clients with Hotel relation:`);
  clients.forEach((c) => {
    console.log(`- Client ID ${c.id}: ${c.fullName} -> Hotel: ${c.hotel?.name || 'None'} (Room: ${c.roomNumber || 'N/A'})`);
  });
}

testApiData()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
