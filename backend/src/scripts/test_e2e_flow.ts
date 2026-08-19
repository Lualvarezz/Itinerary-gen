import { prisma } from '../lib/prisma.js';

async function main() {
  console.log('--- Testing Complete End-to-End Flow ---');

  // 1. Create Category
  const category = await prisma.category.create({
    data: {
      name: `Tours Náuticos E2E ${Date.now()}`,
      description: 'Paseos en lancha y yate',
    },
  });
  console.log('1. Category created:', category.id, category.name);

  // 2. Create Tourist Place
  const place = await prisma.touristPlace.create({
    data: {
      name: `Islas del Rosario E2E ${Date.now()}`,
      city: 'Cartagena',
    },
  });
  console.log('2. Tourist Place created:', place.id, place.name);

  // 3. Create Client
  const client = await prisma.client.create({
    data: {
      fullName: 'Carlos Andrés Mendoza E2E',
      documentNumber: `CC-${Date.now()}`,
      email: 'carlos.mendoza@test.com',
      nationality: 'Colombiana',
      numberOfPeople: 4,
      createdByUserId: '11111111-1111-1111-1111-111111111111',
    },
  });
  console.log('3. Client created:', client.id, client.fullName, 'Pax:', client.numberOfPeople);

  // 4. Create Activity
  const activity = await prisma.activity.create({
    data: {
      name: `Tour Privado Islas del Rosario E2E ${Date.now()}`,
      price: 250000,
      durationMinutes: 240,
      touristPlaceId: place.id,
      categoryId: category.id,
      createdByUserId: '11111111-1111-1111-1111-111111111111',
    },
  });
  console.log('4. Activity created:', activity.id, activity.name, 'Price:', activity.price);

  // 5. Create Schedule
  const schedule = await prisma.schedule.create({
    data: {
      activityId: activity.id,
      scheduleDate: new Date('2026-09-15'),
      startTime: new Date('1970-01-01T08:30:00Z'),
      endTime: new Date('1970-01-01T12:30:00Z'),
      capacity: 10,
      availableSlots: 10,
      createdByUserId: '11111111-1111-1111-1111-111111111111',
    },
  });
  console.log('5. Schedule created:', schedule.id, 'Capacity:', schedule.capacity, 'Available:', schedule.availableSlots);

  // 6. Create Itinerary with items
  const itinerary = await prisma.itinerary.create({
    data: {
      clientId: client.id,
      operatorUserId: '11111111-1111-1111-1111-111111111111',
      status: 'draft',
      observations: 'Cliente VIP requiere bebidas a bordo',
      totalAmount: 1000000,
      items: {
        create: [
          {
            activityId: activity.id,
            scheduleId: schedule.id,
            quantityPeople: 4,
            unitPrice: 250000,
            subtotal: 1000000,
          },
        ],
      },
    },
    include: {
      client: true,
      items: {
        include: {
          activity: true,
          schedule: true,
        },
      },
    },
  });
  console.log('6. Itinerary created:', itinerary.id, 'Total:', itinerary.totalAmount, 'Items count:', itinerary.items.length);

  // Cleanup test data
  await prisma.itineraryItem.deleteMany({ where: { itineraryId: itinerary.id } });
  await prisma.itinerary.delete({ where: { id: itinerary.id } });
  await prisma.schedule.delete({ where: { id: schedule.id } });
  await prisma.activity.delete({ where: { id: activity.id } });
  await prisma.client.delete({ where: { id: client.id } });
  await prisma.touristPlace.delete({ where: { id: place.id } });
  await prisma.category.delete({ where: { id: category.id } });

  console.log('--- All E2E Tests Passed and Cleaned Up Successfully! ---');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('E2E Test Failed:', e);
  process.exit(1);
});
