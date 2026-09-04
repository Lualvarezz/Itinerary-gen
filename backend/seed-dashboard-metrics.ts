import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDashboardMetrics() {
  console.log('--- SEEDING DASHBOARD METRICS & RESERVATIONS ---');

  const user = await prisma.user.findFirst();
  if (!user) throw new Error('No user found in DB');
  const userId = user.id;

  // 1. Update Acquisition Channels for 32 clients via executeRaw
  const clients = await prisma.client.findMany({ orderBy: { id: 'asc' } });
  console.log(`Updating acquisition channels for ${clients.length} clients...`);

  const channelsList = [
    'Recomendación de Hotel', 'Recomendación de Hotel', 'Recomendación de Hotel', 'Recomendación de Hotel',
    'Instagram', 'Instagram', 'Instagram',
    'WhatsApp', 'WhatsApp',
    'Sitio Web',
    'Google / Búsqueda',
    'Recomendación de Hotel', 'Recomendación de Hotel', 'Instagram', 'Instagram', 'WhatsApp',
    'Recomendación de Hotel', 'Recomendación de Hotel', 'Instagram', 'Instagram', 'Sitio Web',
    'Recomendación de Hotel', 'Recomendación de Hotel', 'WhatsApp', 'Google / Búsqueda', 'Instagram',
    'Recomendación de Hotel', 'Recomendación de Hotel', 'Instagram', 'Sitio Web', 'Recomendación de Hotel', 'Instagram'
  ];

  for (let i = 0; i < clients.length; i++) {
    const channel = channelsList[i % channelsList.length];
    const cId = clients[i].id;
    await prisma.$executeRaw`UPDATE clients SET acquisition_channel = ${channel} WHERE id = ${cId}`;
  }

  // 2. Ensure Tourist Place and Category
  const category = await prisma.category.upsert({
    where: { name: 'Excursiones' },
    update: {},
    create: { name: 'Excursiones', description: 'Tours guiados y actividades en Cartagena' },
  });

  const touristPlace = await prisma.touristPlace.upsert({
    where: { name: 'Centro Histórico' },
    update: {},
    create: { name: 'Centro Histórico', city: 'Cartagena', description: 'Zona colonial' },
  });

  // 3. Ensure Activities
  const actCity = await prisma.activity.upsert({
    where: { id: 1 },
    update: { name: 'Tour por el Centro Histórico', price: 65000 },
    create: {
      id: 1,
      name: 'Tour por el Centro Histórico',
      description: 'Recorrido guiado por plazas, iglesias y murallas',
      price: 65000,
      durationMinutes: 180,
      touristPlaceId: touristPlace.id,
      categoryId: category.id,
      createdByUserId: userId,
    },
  });

  const actRosario = await prisma.activity.upsert({
    where: { id: 2 },
    update: { name: 'Pasadía Islas del Rosario (Bora Bora / Islabela)', price: 390000 },
    create: {
      id: 2,
      name: 'Pasadía Islas del Rosario (Bora Bora / Islabela)',
      description: 'Excursión de día completo en bote rápido',
      price: 390000,
      durationMinutes: 480,
      touristPlaceId: touristPlace.id,
      categoryId: category.id,
      createdByUserId: userId,
    },
  });

  const actBaru = await prisma.activity.upsert({
    where: { id: 3 },
    update: { name: 'Pasadía Club de Playa Isla Barú (Playa Blanca)', price: 160000 },
    create: {
      id: 3,
      name: 'Pasadía Club de Playa Isla Barú (Playa Blanca)',
      description: 'Pasadía en club de playa exclusivo en Barú',
      price: 160000,
      durationMinutes: 420,
      touristPlaceId: touristPlace.id,
      categoryId: category.id,
      createdByUserId: userId,
    },
  });

  const actCatamaran = await prisma.activity.upsert({
    where: { id: 4 },
    update: { name: 'Atardecer en Catamarán por la Bahía', price: 140000 },
    create: {
      id: 4,
      name: 'Atardecer en Catamarán por la Bahía',
      description: 'Navegación al atardecer con bebidas incluidas',
      price: 140000,
      durationMinutes: 150,
      touristPlaceId: touristPlace.id,
      categoryId: category.id,
      createdByUserId: userId,
    },
  });

  // 4. Ensure Schedules
  const scheduleCityManana = await prisma.schedule.upsert({
    where: { id: 1 },
    update: { startTime: new Date('1970-01-01T09:00:00.000Z'), endTime: new Date('1970-01-01T12:00:00.000Z') },
    create: {
      id: 1,
      activityId: actCity.id,
      scheduleDate: new Date('2026-09-10'),
      startTime: new Date('1970-01-01T09:00:00.000Z'),
      endTime: new Date('1970-01-01T12:00:00.000Z'),
      capacity: 30,
      availableSlots: 10,
      createdByUserId: userId,
    },
  });

  const scheduleCityTarde = await prisma.schedule.upsert({
    where: { id: 2 },
    update: { startTime: new Date('1970-01-01T14:00:00.000Z'), endTime: new Date('1970-01-01T17:00:00.000Z') },
    create: {
      id: 2,
      activityId: actCity.id,
      scheduleDate: new Date('2026-09-10'),
      startTime: new Date('1970-01-01T14:00:00.000Z'),
      endTime: new Date('1970-01-01T17:00:00.000Z'),
      capacity: 30,
      availableSlots: 20,
      createdByUserId: userId,
    },
  });

  const scheduleRosario = await prisma.schedule.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      activityId: actRosario.id,
      scheduleDate: new Date('2026-09-11'),
      startTime: new Date('1970-01-01T08:00:00.000Z'),
      endTime: new Date('1970-01-01T16:00:00.000Z'),
      capacity: 25,
      availableSlots: 5,
      createdByUserId: userId,
    },
  });

  const scheduleBaru = await prisma.schedule.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      activityId: actBaru.id,
      scheduleDate: new Date('2026-09-12'),
      startTime: new Date('1970-01-01T08:30:00.000Z'),
      endTime: new Date('1970-01-01T15:30:00.000Z'),
      capacity: 25,
      availableSlots: 12,
      createdByUserId: userId,
    },
  });

  const scheduleCatamaran = await prisma.schedule.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      activityId: actCatamaran.id,
      scheduleDate: new Date('2026-09-13'),
      startTime: new Date('1970-01-01T17:00:00.000Z'),
      endTime: new Date('1970-01-01T19:30:00.000Z'),
      capacity: 40,
      availableSlots: 15,
      createdByUserId: userId,
    },
  });

  // 5. Create Itineraries and Items for all 32 clients
  console.log('Generating itineraries and itinerary items...');
  const schedulesArr = [
    scheduleCityManana, scheduleCityManana, scheduleRosario, scheduleCityManana,
    scheduleBaru, scheduleCatamaran, scheduleCityTarde, scheduleRosario,
    scheduleCityManana, scheduleRosario, scheduleBaru, scheduleCatamaran,
    scheduleCityManana, scheduleCityTarde, scheduleRosario, scheduleBaru
  ];

  for (let i = 0; i < clients.length; i++) {
    const cl = clients[i];
    const sch = schedulesArr[i % schedulesArr.length];
    const actId = sch.activityId;

    let unitPrice = 65000;
    if (actId === actRosario.id) unitPrice = 390000;
    else if (actId === actBaru.id) unitPrice = 160000;
    else if (actId === actCatamaran.id) unitPrice = 140000;

    const people = cl.numberOfPeople || 2;
    const total = unitPrice * people;

    let itinerary = await prisma.itinerary.findFirst({
      where: { clientId: cl.id },
    });

    if (!itinerary) {
      itinerary = await prisma.itinerary.create({
        data: {
          clientId: cl.id,
          operatorUserId: userId,
          status: 'confirmed',
          observations: `Reserva para ${cl.fullName}`,
          totalAmount: total,
          isComplete: true,
        },
      });
    } else {
      await prisma.itinerary.update({
        where: { id: itinerary.id },
        data: { totalAmount: total, status: 'confirmed' },
      });
    }

    const existingItem = await prisma.itineraryItem.findFirst({
      where: { itineraryId: itinerary.id, scheduleId: sch.id },
    });

    if (!existingItem) {
      await prisma.itineraryItem.create({
        data: {
          itineraryId: itinerary.id,
          activityId: actId,
          scheduleId: sch.id,
          quantityPeople: people,
          unitPrice,
          subtotal: total,
        },
      });
    }
  }

  const finalItinCount = await prisma.itinerary.count();
  const finalItemsCount = await prisma.itineraryItem.count();
  console.log(`--- SEED METRICS COMPLETE ---`);
  console.log(`Itineraries: ${finalItinCount} | Items: ${finalItemsCount}`);
}

seedDashboardMetrics()
  .catch((e) => {
    console.error('Error seeding metrics:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
