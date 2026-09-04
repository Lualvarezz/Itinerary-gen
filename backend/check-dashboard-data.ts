import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [clients, hotels, activities, schedules, itineraries, itineraryItems] = await Promise.all([
    prisma.client.count(),
    prisma.hotel.count(),
    prisma.activity.count(),
    prisma.schedule.count(),
    prisma.itinerary.count(),
    prisma.itineraryItem.count(),
  ]);

  console.log('--- CURRENT DB DATA COUNTS ---');
  console.log({ clients, hotels, activities, schedules, itineraries, itineraryItems });
}

main().catch(console.error).finally(() => prisma.$disconnect());
