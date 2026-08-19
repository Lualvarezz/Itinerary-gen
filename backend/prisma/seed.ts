import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('12345678', 10);

  const user = await prisma.user.upsert({
    where: { email: 'carmenalvarezmar@gmail.com' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      fullName: 'Carmen Alvarez',
      email: 'carmenalvarezmar@gmail.com',
      passwordHash,
      role: 'admin',
      status: 'active',
    },
  });

  const category = await prisma.category.upsert({
    where: { name: 'Excursiones' },
    update: {},
    create: {
      name: 'Excursiones',
      description: 'Actividades guiadas en Cartagena',
      status: 'active',
    },
  });

  const touristPlace = await prisma.touristPlace.upsert({
    where: { name: 'Centro Histórico' },
    update: {},
    create: {
      name: 'Centro Histórico',
      description: 'Zona colonial y patrimonio de Cartagena',
      city: 'Cartagena',
      location: 'Cartagena de Indias',
      status: 'active',
    },
  });

  const activity = await prisma.activity.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Tour por el Centro Histórico',
      description: 'Recorrido guiado por plazas, iglesias y callejones',
      price: 65000,
      durationMinutes: 180,
      touristPlaceId: touristPlace.id,
      categoryId: category.id,
      createdByUserId: user.id,
      status: 'available',
    },
  });

  const activity2 = await prisma.activity.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Sunset en la Bocana',
      description: 'Paseo en barco con vista al atardecer',
      price: 95000,
      durationMinutes: 120,
      touristPlaceId: touristPlace.id,
      categoryId: category.id,
      createdByUserId: user.id,
      status: 'available',
    },
  });

  const client = await prisma.client.upsert({
    where: { documentNumber: '1010101010' },
    update: {},
    create: {
      fullName: 'María Fernanda López',
      documentNumber: '1010101010',
      email: 'maria@example.com',
      phone: '3001234567',
      nationality: 'Colombiana',
      numberOfPeople: 2,
      observations: 'Cliente frecuente',
      createdByUserId: user.id,
      status: 'active',
    },
  });

  const schedule1 = await prisma.schedule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      activityId: activity.id,
      scheduleDate: new Date('2026-08-10'),
      startTime: new Date('1970-01-01T09:00:00.000Z'),
      endTime: new Date('1970-01-01T12:00:00.000Z'),
      capacity: 20,
      availableSlots: 10,
      status: 'available',
      createdByUserId: user.id,
    },
  });

  const schedule2 = await prisma.schedule.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      activityId: activity2.id,
      scheduleDate: new Date('2026-08-11'),
      startTime: new Date('1970-01-01T16:00:00.000Z'),
      endTime: new Date('1970-01-01T18:00:00.000Z'),
      capacity: 15,
      availableSlots: 8,
      status: 'available',
      createdByUserId: user.id,
    },
  });

  const itinerary = await prisma.itinerary.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      clientId: client.id,
      operatorUserId: user.id,
      status: 'draft',
      observations: 'Itinerario base para prueba',
      totalAmount: 0,
      isComplete: false,
    },
  });

  await prisma.itineraryItem.createMany({
    data: [
      {
        itineraryId: itinerary.id,
        activityId: activity.id,
        scheduleId: schedule1.id,
        quantityPeople: 2,
        unitPrice: 65000,
        subtotal: 130000,
      },
      {
        itineraryId: itinerary.id,
        activityId: activity2.id,
        scheduleId: schedule2.id,
        quantityPeople: 2,
        unitPrice: 95000,
        subtotal: 190000,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.itinerary.update({
    where: { id: itinerary.id },
    data: { totalAmount: 320000 },
  });

  console.log('Seed listo: usuario, cliente, actividades, horarios e itinerario base');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
