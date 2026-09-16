import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING LOCAL DATABASE SEED ---');

  // 1. Users
  console.log('Seeding users...');
  let adminUser = await prisma.user.findUnique({ where: { email: 'carmenalvarezmar@gmail.com' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        id: '11111111-1111-1111-1111-111111111111',
        fullName: 'Carmen Alvarez',
        email: 'carmenalvarezmar@gmail.com',
        passwordHash: '$2a$10$QYlnm7o0Ae58W6SgS2dJx.6wC6D5J0dqF4yq4iVYB3M5szwWnQ6s2', // 12345678
        role: 'admin',
        status: 'active',
      },
    });
  }

  let demoUser = await prisma.user.findUnique({ where: { email: 'admin@cartagena.com' } });
  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        id: '22222222-2222-2222-2222-222222222222',
        fullName: 'Admin Demo',
        email: 'admin@cartagena.com',
        passwordHash: '$2a$10$QYlnm7o0Ae58W6SgS2dJx.6wC6D5J0dqF4yq4iVYB3M5szwWnQ6s2', // password123
        role: 'admin',
        status: 'active',
      },
    });
  }

  const userId = adminUser.id;

  // 2. Hotels
  console.log('Seeding hotels...');
  const hotelsData = [
    { name: 'Sofitel Legend Santa Clara', address: 'Calle del Torno # 39-29', zone: 'Centro Histórico', sector: 'San Diego', contactPhone: '+57 605 650 4700', commissionRate: 10.0 },
    { name: 'Hotel Charleston Santa Teresa', address: 'Carrera 3 # 31-23', zone: 'Centro Histórico', sector: 'Plaza Santa Teresa', contactPhone: '+57 605 664 9494', commissionRate: 12.0 },
    { name: 'Hotel Casa San Agustín', address: 'Calle de la Universidad # 36-44', zone: 'Centro Histórico', sector: 'Centro', contactPhone: '+57 605 681 0000', commissionRate: 10.0 },
    { name: 'Hyatt Regency Cartagena', address: 'Carrera 1 # 12-118', zone: 'Bocagrande', sector: 'Carrera 1', contactPhone: '+57 605 694 1234', commissionRate: 10.0 },
    { name: 'Hotel Las Américas', address: 'Anillo Vial, Sector Cielo Mar', zone: 'Zona Norte', sector: 'Cielo Mar', contactPhone: '+57 605 656 7000', commissionRate: 12.0 },
  ];

  const createdHotels = [];
  for (const h of hotelsData) {
    const existing = await prisma.hotel.findFirst({ where: { name: h.name } });
    if (existing) {
      createdHotels.push(existing);
    } else {
      const created = await prisma.hotel.create({
        data: { ...h, userId, status: 'active' },
      });
      createdHotels.push(created);
    }
  }

  // 3. Categories
  console.log('Seeding categories...');
  const catExcursiones = await prisma.category.upsert({
    where: { name: 'Tours y Excursiones' },
    update: {},
    create: { name: 'Tours y Excursiones', description: 'Recorridos guiados y culturales' },
  });

  const catNautica = await prisma.category.upsert({
    where: { name: 'Náutica y Playas' },
    update: {},
    create: { name: 'Náutica y Playas', description: 'Pasadías e islas en el mar' },
  });

  const catCultura = await prisma.category.upsert({
    where: { name: 'Cultura e Historia' },
    update: {},
    create: { name: 'Cultura e Historia', description: 'Museos y monumentos históricos' },
  });

  // 4. Tourist Places
  console.log('Seeding tourist places...');
  const placeCentro = await prisma.touristPlace.upsert({
    where: { name: 'Centro Histórico / Ciudad Amurallada' },
    update: {},
    create: { name: 'Centro Histórico / Ciudad Amurallada', city: 'Cartagena', description: 'Zona colonial y murallas' },
  });

  const placeIslas = await prisma.touristPlace.upsert({
    where: { name: 'Islas del Rosario & Barú' },
    update: {},
    create: { name: 'Islas del Rosario & Barú', city: 'Cartagena', description: 'Archipiélago y playas de agua cristalina' },
  });

  const placeCastillo = await prisma.touristPlace.upsert({
    where: { name: 'Castillo de San Felipe' },
    update: {},
    create: { name: 'Castillo de San Felipe', city: 'Cartagena', description: 'Fortificación militar histórica' },
  });

  // 5. Activities
  console.log('Seeding activities...');
  const existingActivities = await prisma.activity.findMany();
  let act1, act2, act3, act4;

  if (existingActivities.length > 0) {
    [act1, act2, act3, act4] = existingActivities;
  } else {
    act1 = await prisma.activity.create({
      data: {
        name: 'Tour Guiado por el Centro Histórico',
        description: 'Caminata histórica guiada por plazas, calles y murallas de la ciudad colonial.',
        price: 65000,
        durationMinutes: 180,
        touristPlaceId: placeCentro.id,
        categoryId: catExcursiones.id,
        createdByUserId: userId,
        status: 'available',
      },
    });

    act2 = await prisma.activity.create({
      data: {
        name: 'Pasadía VIP Islas del Rosario (Bora Bora)',
        description: 'Excursión en lancha rápida hacia la isla privada con cóctel de bienvenida y almuerzo buffet.',
        price: 390000,
        durationMinutes: 480,
        touristPlaceId: placeIslas.id,
        categoryId: catNautica.id,
        createdByUserId: userId,
        status: 'available',
      },
    });

    act3 = await prisma.activity.create({
      data: {
        name: 'Pasadía Club de Playa Isla Barú (Playa Blanca)',
        description: 'Día de descanso frente al mar con cama caribeña, almuerzo típico y transporte.',
        price: 160000,
        durationMinutes: 420,
        touristPlaceId: placeIslas.id,
        categoryId: catNautica.id,
        createdByUserId: userId,
        status: 'available',
      },
    });

    act4 = await prisma.activity.create({
      data: {
        name: 'Atardecer en Catamarán por la Bahía de Cartagena',
        description: 'Navegación al atardecer por la bahía con música ambiental, sangría y vista al skyline.',
        price: 140000,
        durationMinutes: 120,
        touristPlaceId: placeCentro.id,
        categoryId: catCultura.id,
        createdByUserId: userId,
        status: 'available',
      },
    });
  }

  // 6. Schedules
  console.log('Seeding schedules...');
  const today = new Date();
  const scheduleDates = [
    new Date(today.getTime() + 86400000 * 1), // Mañana
    new Date(today.getTime() + 86400000 * 2), // Pasado mañana
    new Date(today.getTime() + 86400000 * 3), // En 3 días
  ];

  const createdSchedules = [];
  const activitiesList = [act1, act2, act3, act4].filter(Boolean);

  for (const act of activitiesList) {
    for (const d of scheduleDates) {
      const scheduleDateStr = d.toISOString().split('T')[0];
      const startTime = new Date(`${scheduleDateStr}T09:00:00.000Z`);
      const endTime = new Date(`${scheduleDateStr}T12:00:00.000Z`);

      const schedule = await prisma.schedule.create({
        data: {
          activityId: act.id,
          scheduleDate: startTime,
          startTime: startTime,
          endTime: endTime,
          capacity: 15,
          availableSlots: 15,
          status: 'available',
          createdByUserId: userId,
        },
      });
      createdSchedules.push(schedule);
    }
  }

  // 7. Clients
  console.log('Seeding clients...');
  const clientsData = [
    { fullName: 'Carlos Eduardo Mendoza', documentNumber: '1098452391', email: 'carlos.mendoza@gmail.com', phone: '+57 315 489 2011', nationality: 'Colombia', numberOfPeople: 2, hotelId: createdHotels[0]?.id },
    { fullName: 'Sofia Isabella Rossi', documentNumber: 'ARG-84920192', email: 'sofia.rossi@hotmail.com', phone: '+54 9 11 4820 9182', nationality: 'Argentina', numberOfPeople: 3, hotelId: createdHotels[1]?.id },
    { fullName: 'Michael Arthur Smith', documentNumber: 'US-920194827', email: 'michael.smith@yahoo.com', phone: '+1 305 892 1049', nationality: 'Estados Unidos', numberOfPeople: 4, hotelId: createdHotels[2]?.id },
    { fullName: 'Valentina Gomez', documentNumber: '1019284756', email: 'valentina.g@outlook.com', phone: '+57 300 123 4567', nationality: 'Colombia', numberOfPeople: 2, hotelId: createdHotels[3]?.id },
  ];

  const createdClients = [];
  for (const c of clientsData) {
    const existing = await prisma.client.findUnique({ where: { documentNumber: c.documentNumber } });
    if (existing) {
      createdClients.push(existing);
    } else {
      const created = await prisma.client.create({
        data: {
          ...c,
          createdByUserId: userId,
          status: 'active',
        },
      });
      createdClients.push(created);
    }
  }

  // 8. Sample Itinerary
  console.log('Seeding sample itinerary...');
  const existingItineraries = await prisma.itinerary.findMany();
  if (existingItineraries.length === 0 && createdClients.length > 0 && createdSchedules.length > 0) {
    const client = createdClients[0];
    const sched1 = createdSchedules[0];
    const sched2 = createdSchedules[1];

    await prisma.itinerary.create({
      data: {
        clientId: client.id,
        operatorUserId: userId,
        status: 'draft',
        observations: 'Cliente requiere comida vegetariana para las excursiones.',
        totalAmount: (act1?.price ? Number(act1.price) : 65000) * 2 + (act2?.price ? Number(act2.price) : 390000) * 2,
        isComplete: false,
        items: {
          create: [
            {
              activityId: sched1.activityId,
              scheduleId: sched1.id,
              quantityPeople: 2,
              unitPrice: act1?.price ? Number(act1.price) : 65000,
              subtotal: (act1?.price ? Number(act1.price) : 65000) * 2,
            },
            {
              activityId: sched2.activityId,
              scheduleId: sched2.id,
              quantityPeople: 2,
              unitPrice: act2?.price ? Number(act2.price) : 390000,
              subtotal: (act2?.price ? Number(act2.price) : 390000) * 2,
            },
          ],
        },
      },
    });
  }

  console.log('--- LOCAL DATABASE SEED COMPLETED SUCCESSFULLY! ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
