import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 --- SEEDING PROYECTO ITINERARIOS TURÍSTICOS CARTAGENA ---');

  const passwordHash = await bcrypt.hash('12345678', 10);

  // 1. USUARIOS (Admin y Operador)
  console.log('👤 Creando usuarios base...');
  const adminUser = await prisma.user.upsert({
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

  const demoUser = await prisma.user.upsert({
    where: { email: 'admin@cartagena.com' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      fullName: 'Admin Demo Operador',
      email: 'admin@cartagena.com',
      passwordHash,
      role: 'admin',
      status: 'active',
    },
  });

  const userId = adminUser.id;

  // 2. HOTELES ESTRATÉGICOS (Bocagrande, Centro Histórico, Getsemaní, Zona Norte, Barú)
  console.log('🏨 Creando hoteles estratégicos de Cartagena...');
  const hotelsData = [
    {
      name: 'Hotel Capilla del Mar',
      address: 'Carrera 1 # 8-12',
      zone: 'Bocagrande',
      sector: 'Bocagrande Playa (5 Estrellas)',
      contactPhone: '+57 605 650 1500',
      commissionRate: 10.0,
    },
    {
      name: 'Decameron Cartagena All-Inclusive',
      address: 'Avenida San Martín # 10-10',
      zone: 'Bocagrande',
      sector: 'Bocagrande Resort',
      contactPhone: '+57 605 650 2000',
      commissionRate: 10.0,
    },
    {
      name: 'Hotel Bastión Luxury Hotel',
      address: 'Calle del Cuartel # 36-06',
      zone: 'Centro Histórico',
      sector: 'Centro Boutique Luxury (5 Estrellas)',
      contactPhone: '+57 605 664 1000',
      commissionRate: 12.0,
    },
    {
      name: 'Nacar Hotel Cartagena, Curio Collection',
      address: 'Calle del Curato # 38-99',
      zone: 'Centro Histórico',
      sector: 'San Diego Boutique (5 Estrellas)',
      contactPhone: '+57 605 651 7000',
      commissionRate: 12.0,
    },
    {
      name: 'Hotel Casa Claver Loft Boutique',
      address: 'Calle de San Juan # 25-88',
      zone: 'Getsemaní',
      sector: 'Getsemaní Boutique',
      contactPhone: '+57 605 660 0080',
      commissionRate: 10.0,
    },
    {
      name: 'Viajero Hostel Cartagena',
      address: 'Calle del Porvenir # 35-56',
      zone: 'Getsemaní',
      sector: 'Getsemaní Hostel',
      contactPhone: '+57 605 664 3456',
      commissionRate: 8.0,
    },
    {
      name: 'Radisson Hotel Cartagena Ocean Pavillion',
      address: 'Carrera 9 # 22-750, La Boquilla',
      zone: 'Zona Norte',
      sector: 'Zona Norte Beach Resort (5 Estrellas)',
      contactPhone: '+57 605 656 9000',
      commissionRate: 10.0,
    },
    {
      name: 'Aura Hotel Barú',
      address: 'Ensenada de Cholón, Isla Barú',
      zone: 'Barú',
      sector: 'Zona Insular Eco-Resort',
      contactPhone: '+57 605 693 1122',
      commissionRate: 15.0,
    },
  ];

  const createdHotelsMap: Record<string, number> = {};

  for (const h of hotelsData) {
    const existing = await prisma.hotel.findFirst({ where: { name: h.name } });
    if (existing) {
      createdHotelsMap[h.name] = existing.id;
    } else {
      const created = await prisma.hotel.create({
        data: {
          ...h,
          userId,
          status: 'active',
        },
      });
      createdHotelsMap[h.name] = created.id;
    }
  }

  // 3. CATEGORÍAS
  console.log('📂 Creando categorías...');
  const catExcursiones = await prisma.category.upsert({
    where: { name: 'Tours y Excursiones' },
    update: {},
    create: { name: 'Tours y Excursiones', description: 'Recorridos guiados históricos y culturales' },
  });

  const catNautica = await prisma.category.upsert({
    where: { name: 'Náutica y Playas' },
    update: {},
    create: { name: 'Náutica y Playas', description: 'Pasadías en islas, mar y deportes acuáticos' },
  });

  const catCultura = await prisma.category.upsert({
    where: { name: 'Cultura e Historia' },
    update: {},
    create: { name: 'Cultura e Historia', description: 'Monumentos, museos y leyendas de Cartagena' },
  });

  const catGastroNoche = await prisma.category.upsert({
    where: { name: 'Gastronomía y Vida Nocturna' },
    update: {},
    create: { name: 'Gastronomía y Vida Nocturna', description: 'Tours de comida callejera, chivas y catamarán' },
  });

  // 4. LUGARES TURÍSTICOS
  console.log('📍 Creando lugares turísticos...');
  const placeCentro = await prisma.touristPlace.upsert({
    where: { name: 'Centro Histórico / Ciudad Amurallada' },
    update: {},
    create: { name: 'Centro Histórico / Ciudad Amurallada', city: 'Cartagena', description: 'Patrimonio histórico de la humanidad' },
  });

  const placeIslas = await prisma.touristPlace.upsert({
    where: { name: 'Islas del Rosario & Barú' },
    update: {},
    create: { name: 'Islas del Rosario & Barú', city: 'Cartagena', description: 'Archipiélago natural y clubes de playa' },
  });

  const placeCastillo = await prisma.touristPlace.upsert({
    where: { name: 'Castillo San Felipe & La Popa' },
    update: {},
    create: { name: 'Castillo San Felipe & La Popa', city: 'Cartagena', description: 'Fortificación militar e iglesias en el cerro' },
  });

  const placeGetsemani = await prisma.touristPlace.upsert({
    where: { name: 'Barrio Getsemaní' },
    update: {},
    create: { name: 'Barrio Getsemaní', city: 'Cartagena', description: 'Barrio cultural, murales y gastronomía' },
  });

  const placeGalerazamba = await prisma.touristPlace.upsert({
    where: { name: 'Salinas de Galerazamba & Volcán Totumo' },
    update: {},
    create: { name: 'Salinas de Galerazamba & Volcán Totumo', city: 'Santa Catalina / Galerazamba', description: 'Mar rosado y lodo medicinal' },
  });

  // 5. TOURS Y EXPERIENCIAS LOCALES (10 Tours Reales)
  console.log('⛵ Creando catálogo de 10 tours y experiencias reales...');
  const toursList = [
    {
      name: 'Pasadía VIP Islas del Rosario (Bora Bora & Islabela)',
      description: 'Excursión completa en bote rápido a club de playa privado con cóctel de bienvenida y almuerzo buffet gourmet.',
      price: 390000,
      durationMinutes: 480,
      touristPlaceId: placeIslas.id,
      categoryId: catNautica.id,
    },
    {
      name: 'City Tour Histórico Colonial en la Mañana',
      description: 'Recorrido guiado a pie por murallas, bastiones, plazas coloniales e iglesias del Centro Histórico.',
      price: 75000,
      durationMinutes: 210,
      touristPlaceId: placeCentro.id,
      categoryId: catExcursiones.id,
    },
    {
      name: 'City Tour al Atardecer por Murallas y Baluartes',
      description: 'Paseo al atardecer sobre las murallas contemplando el skyline de Bocagrande y la puesta de sol caribeña.',
      price: 85000,
      durationMinutes: 180,
      touristPlaceId: placeCentro.id,
      categoryId: catExcursiones.id,
    },
    {
      name: 'Tour Gastronómico y Street Food por Getsemaní',
      description: 'Caminata cultural degustando arepas de huevo, carimañolas, frutas tropicales y dulces típicos en Getsemaní.',
      price: 110000,
      durationMinutes: 150,
      touristPlaceId: placeGetsemani.id,
      categoryId: catGastroNoche.id,
    },
    {
      name: 'Paseo al Atardecer en Catamarán por la Bahía',
      description: 'Navegación romántica de 2 horas al atardecer con copa de vino/sangría, música lounge y vistas inolvidables.',
      price: 140000,
      durationMinutes: 120,
      touristPlaceId: placeCentro.id,
      categoryId: catGastroNoche.id,
    },
    {
      name: 'Pasadía VIP en Barú / Playa Blanca & Club de Playa',
      description: 'Transporte terrestre/marítimo a cama caribeña reservada en club de playa exclusivo con almuerzo caribeño.',
      price: 180000,
      durationMinutes: 420,
      touristPlaceId: placeIslas.id,
      categoryId: catNautica.id,
    },
    {
      name: 'Chiva Rumbera Nocturna con Vallenato y Animación',
      description: 'Recorrido en chiva típica con conjunto vallenato en vivo, licor nacional y parada en la discoteca en el Centro.',
      price: 65000,
      durationMinutes: 150,
      touristPlaceId: placeCentro.id,
      categoryId: catGastroNoche.id,
    },
    {
      name: 'Tour Castillo San Felipe y Convento de La Popa',
      description: 'Visita completa al castillo fortificado más grande de América y al claustro del cerro de La Popa con guía oficial.',
      price: 95000,
      durationMinutes: 240,
      touristPlaceId: placeCastillo.id,
      categoryId: catCultura.id,
    },
    {
      name: 'Excursión al Mar Rosado de Galerazamba y Volcán del Totumo',
      description: 'Tour de día completo hacia las salinas rosadas de Galerazamba con baño sanador en lodo dentro del volcán.',
      price: 165000,
      durationMinutes: 360,
      touristPlaceId: placeGalerazamba.id,
      categoryId: catExcursiones.id,
    },
    {
      name: 'Tour Nocturno de Mitos, Leyendas y Fantasmas',
      description: 'Caminata nocturna relatando las historias de piratas, la inquisición y mitos coloniales de las casonas.',
      price: 70000,
      durationMinutes: 120,
      touristPlaceId: placeCentro.id,
      categoryId: catCultura.id,
    },
  ];

  const createdActivities: any[] = [];
  for (const t of toursList) {
    let act = await prisma.activity.findFirst({ where: { name: t.name } });
    if (!act) {
      act = await prisma.activity.create({
        data: {
          name: t.name,
          description: t.description,
          price: t.price,
          durationMinutes: t.durationMinutes,
          touristPlaceId: t.touristPlaceId,
          categoryId: t.categoryId,
          createdByUserId: userId,
          status: 'available',
        },
      });
    }
    createdActivities.push(act);
  }

  // 6. HORARIOS (Schedules)
  console.log('⏰ Generando horarios para las actividades...');
  const baseDate = new Date();
  const scheduleDates = [
    new Date(baseDate.getTime() + 86400000 * 1), // Mañana
    new Date(baseDate.getTime() + 86400000 * 2), // Pasado mañana
    new Date(baseDate.getTime() + 86400000 * 3), // En 3 días
  ];

  const createdSchedules: any[] = [];
  for (const act of createdActivities) {
    for (const d of scheduleDates) {
      const dateStr = d.toISOString().split('T')[0];
      const isMorning = act.durationMinutes >= 300 || act.name.includes('Mañana') || act.name.includes('VIP');
      const startTimeStr = isMorning ? '08:30' : (act.name.includes('Atardecer') ? '16:30' : '20:00');
      const endTimeStr = isMorning ? '16:30' : (act.name.includes('Atardecer') ? '19:00' : '22:30');

      const startDateTime = new Date(`${dateStr}T${startTimeStr}:00.000Z`);
      const endDateTime = new Date(`${dateStr}T${endTimeStr}:00.000Z`);

      const sched = await prisma.schedule.create({
        data: {
          activityId: act.id,
          scheduleDate: startDateTime,
          startTime: startDateTime,
          endTime: endDateTime,
          capacity: 25,
          availableSlots: 25,
          status: 'available',
          createdByUserId: userId,
        },
      });
      createdSchedules.push(sched);
    }
  }

  // 7. CLIENTES (18 Clientes con Perfiles Variados Nacionales e Internacionales)
  console.log('👥 Creando 18 clientes con perfil demográfico completo...');
  const clientsData = [
    {
      fullName: 'Juan Camilo Osorio',
      documentNumber: '1098452391',
      email: 'juan.osorio@bogota.co',
      phone: '+57 315 489 2011',
      nationality: 'Colombia (Bogotá)',
      numberOfPeople: 2,
      acquisitionChannel: 'Recomendación de Hotel',
      hotelName: 'Hotel Capilla del Mar',
      roomNumber: '1204',
      observations: 'Matrimonio en aniversario de bodas.',
    },
    {
      fullName: 'Camila Andrea Restrepo',
      documentNumber: '1017283940',
      email: 'camila.restrepo@medellin.co',
      phone: '+57 300 918 2736',
      nationality: 'Colombia (Medellín)',
      numberOfPeople: 4,
      acquisitionChannel: 'Instagram',
      hotelName: 'Decameron Cartagena All-Inclusive',
      roomNumber: '405',
      observations: 'Grupo familiar de 4 personas.',
    },
    {
      fullName: 'Diego Fernando Caicedo',
      documentNumber: '1144029182',
      email: 'diego.caicedo@cali.co',
      phone: '+57 318 726 1092',
      nationality: 'Colombia (Cali)',
      numberOfPeople: 3,
      acquisitionChannel: 'WhatsApp',
      hotelName: 'Hotel Bastión Luxury Hotel',
      roomNumber: '210',
      observations: 'Viaje ejecutivo y turismo.',
    },
    {
      fullName: 'Mariana Silva',
      documentNumber: '1095829102',
      email: 'mariana.silva@bucaramanga.co',
      phone: '+57 316 482 9102',
      nationality: 'Colombia (Bucaramanga)',
      numberOfPeople: 2,
      acquisitionChannel: 'Sitio Web',
      hotelName: 'Hotel Capilla del Mar',
      roomNumber: '802',
      observations: 'Reserva prioritaria vista al mar.',
    },
    {
      fullName: 'John & Sarah Miller',
      documentNumber: 'US-920194827',
      email: 'john.miller@nyctravel.com',
      phone: '+1 212 555 0192',
      nationality: 'Estados Unidos',
      numberOfPeople: 2,
      acquisitionChannel: 'Recomendación de Hotel',
      hotelName: 'Nacar Hotel Cartagena, Curio Collection',
      roomNumber: '304',
      observations: 'Requiere guía bilingüe inglés fluido.',
    },
    {
      fullName: 'David & Emily Wilson',
      documentNumber: 'US-849201928',
      email: 'emily.wilson@miamiflight.com',
      phone: '+1 305 892 1049',
      nationality: 'Estados Unidos',
      numberOfPeople: 4,
      acquisitionChannel: 'Instagram',
      hotelName: 'Hotel Capilla del Mar',
      roomNumber: '1501',
      observations: 'Interesados en actividades acuáticas e islas.',
    },
    {
      fullName: 'Gonzalo & Lucía Fernández',
      documentNumber: 'ARG-38492019',
      email: 'gonzalo.fernandez@buenosaires.ar',
      phone: '+54 9 11 4820 9182',
      nationality: 'Argentina',
      numberOfPeople: 2,
      acquisitionChannel: 'Recomendación de Hotel',
      hotelName: 'Hotel Casa Claver Loft Boutique',
      roomNumber: 'Loft-2',
      observations: 'Amantes del arte y la gastronomía colonial.',
    },
    {
      fullName: 'Mateo Rossi',
      documentNumber: 'ARG-40192837',
      email: 'mateo.rossi@cordoba.ar',
      phone: '+54 9 351 928 1029',
      nationality: 'Argentina',
      numberOfPeople: 1,
      acquisitionChannel: 'Google / Búsqueda',
      hotelName: 'Viajero Hostel Cartagena',
      roomNumber: 'Bed-14',
      observations: 'Viajero libre, tours rumberos y caminatas.',
    },
    {
      fullName: 'Javier & Elena Benítez',
      documentNumber: 'ESP-48291029B',
      email: 'javier.benitez@madrid.es',
      phone: '+34 612 839 201',
      nationality: 'España',
      numberOfPeople: 2,
      acquisitionChannel: 'Instagram',
      hotelName: 'Hotel Bastión Luxury Hotel',
      roomNumber: 'Suite-101',
      observations: 'Interesados en historia colonial y arquitectura.',
    },
    {
      fullName: 'Pablo & Carmen Navarro',
      documentNumber: 'ESP-59201948C',
      email: 'pablo.navarro@barcelona.es',
      phone: '+34 689 102 938',
      nationality: 'España',
      numberOfPeople: 3,
      acquisitionChannel: 'Sitio Web',
      hotelName: 'Radisson Hotel Cartagena Ocean Pavillion',
      roomNumber: '612',
      observations: 'Familia en vacaciones de verano.',
    },
    {
      fullName: 'Pierre & Sophie Laurent',
      documentNumber: 'FRA-92019482',
      email: 'pierre.laurent@paris.fr',
      phone: '+33 6 12 34 56 78',
      nationality: 'Francia',
      numberOfPeople: 2,
      acquisitionChannel: 'Recomendación de Hotel',
      hotelName: 'Hotel Bastión Luxury Hotel',
      roomNumber: '302',
      observations: 'Tour gastronómico degustación gourmet.',
    },
    {
      fullName: 'Lars & Greta Weber',
      documentNumber: 'DEU-83920194',
      email: 'lars.weber@berlin.de',
      phone: '+49 171 8920192',
      nationality: 'Alemania',
      numberOfPeople: 2,
      acquisitionChannel: 'WhatsApp',
      hotelName: 'Aura Hotel Barú',
      roomNumber: 'Bungalow-5',
      observations: 'Reserva en Barú para pasadías ecológicos.',
    },
    {
      fullName: 'Thiago & Larissa Santos',
      documentNumber: 'BRA-38291029',
      email: 'thiago.santos@sp.br',
      phone: '+55 11 98201 9283',
      nationality: 'Brasil',
      numberOfPeople: 3,
      acquisitionChannel: 'Instagram',
      hotelName: 'Decameron Cartagena All-Inclusive',
      roomNumber: '508',
      observations: 'Chiva rumbera y paseos en catamarán.',
    },
    {
      fullName: 'Alejandro & Andrea Morales',
      documentNumber: 'MEX-84920192',
      email: 'alejandro.morales@cdmx.mx',
      phone: '+52 55 4829 1029',
      nationality: 'México',
      numberOfPeople: 4,
      acquisitionChannel: 'Google / Búsqueda',
      hotelName: 'Hotel Capilla del Mar',
      roomNumber: '1105',
      observations: 'Familia con niños pequeños.',
    },
    {
      fullName: 'Robert & Linda Taylor',
      documentNumber: 'CAN-92019482',
      email: 'robert.taylor@toronto.ca',
      phone: '+1 416 892 0192',
      nationality: 'Canadá',
      numberOfPeople: 2,
      acquisitionChannel: 'Recomendación de Hotel',
      hotelName: 'Radisson Hotel Cartagena Ocean Pavillion',
      roomNumber: '901',
      observations: 'Escapada invernal al Caribe.',
    },
    {
      fullName: 'Felipe & Tomas Larraín',
      documentNumber: 'CHL-18291029',
      email: 'felipe.larrain@santiago.cl',
      phone: '+56 9 8291 0293',
      nationality: 'Chile',
      numberOfPeople: 2,
      acquisitionChannel: 'Instagram',
      hotelName: 'Nacar Hotel Cartagena, Curio Collection',
      roomNumber: '205',
      observations: 'Pasadía VIP Islas del Rosario.',
    },
    {
      fullName: 'Sebastián Rincón',
      documentNumber: '1088291029',
      email: 'sebastian.rincon@pereira.co',
      phone: '+57 312 892 0192',
      nationality: 'Colombia (Pereira)',
      numberOfPeople: 5,
      acquisitionChannel: 'WhatsApp',
      hotelName: 'Hotel Capilla del Mar',
      roomNumber: '1402',
      observations: 'Grupo empresarial de incentivos.',
    },
    {
      fullName: 'Laura Victoria Varela',
      documentNumber: '1045829102',
      email: 'laura.varela@barranquilla.co',
      phone: '+57 301 928 1029',
      nationality: 'Colombia (Barranquilla)',
      numberOfPeople: 2,
      acquisitionChannel: 'Sitio Web',
      hotelName: 'Hotel Capilla del Mar',
      roomNumber: '704',
      observations: 'Fin de semana de descanso.',
    },
  ];

  const createdClients: any[] = [];
  for (const c of clientsData) {
    const hotelId = createdHotelsMap[c.hotelName];
    const existing = await prisma.client.findUnique({ where: { documentNumber: c.documentNumber } });
    if (existing) {
      createdClients.push(existing);
    } else {
      const created = await prisma.client.create({
        data: {
          fullName: c.fullName,
          documentNumber: c.documentNumber,
          email: c.email,
          phone: c.phone,
          nationality: c.nationality,
          numberOfPeople: c.numberOfPeople,
          acquisitionChannel: c.acquisitionChannel,
          observations: c.observations,
          hotelId: hotelId || null,
          roomNumber: c.roomNumber,
          createdByUserId: userId,
          status: 'active',
        },
      });
      createdClients.push(created);
    }
  }

  // 8. CREAR ITINERARIOS Y RESERVAS PARA ALIMENTAR EL DASHBOARD
  console.log('📋 Generando itinerarios y reservas para alimentar las métricas del Dashboard...');

  // Mapeo de actividades para asociar fácil
  const vipIslas = createdActivities.find((a) => a.name.includes('Pasadía VIP Islas del Rosario'));
  const cityTourColonial = createdActivities.find((a) => a.name.includes('City Tour Histórico Colonial'));
  const sunsetCatamaran = createdActivities.find((a) => a.name.includes('Catamarán'));
  const chivaRumbera = createdActivities.find((a) => a.name.includes('Chiva Rumbera'));
  const baruPlaya = createdActivities.find((a) => a.name.includes('Playa Blanca'));
  const castilloPopa = createdActivities.find((a) => a.name.includes('Castillo San Felipe'));
  const gastroGetsemani = createdActivities.find((a) => a.name.includes('Getsemaní'));

  // Asignamos itinerarios a varios clientes para crear reservas
  for (let i = 0; i < createdClients.length; i++) {
    const client = createdClients[i];
    
    // Elegimos 1 o 2 actividades por cliente para generar datos reales
    const mainAct = (i % 2 === 0) ? vipIslas : cityTourColonial;
    const secondAct = (i % 3 === 0) ? sunsetCatamaran : (i % 4 === 0 ? chivaRumbera : baruPlaya);

    const targetActivities = [mainAct, secondAct].filter(Boolean);
    const itemsToCreate: any[] = [];
    let totalItinAmount = 0;

    for (const act of targetActivities) {
      // Buscar horario correspondiente
      const sched = createdSchedules.find((s) => s.activityId === act.id);
      if (sched) {
        const qty = client.numberOfPeople || 2;
        const uPrice = Number(act.price);
        const sub = uPrice * qty;
        totalItinAmount += sub;

        itemsToCreate.push({
          activityId: act.id,
          scheduleId: sched.id,
          quantityPeople: qty,
          unitPrice: uPrice,
          subtotal: sub,
        });

        // Descontar slots del horario
        await prisma.schedule.update({
          where: { id: sched.id },
          data: {
            availableSlots: Math.max(0, sched.availableSlots - qty),
          },
        });
      }
    }

    if (itemsToCreate.length > 0) {
      await prisma.itinerary.create({
        data: {
          clientId: client.id,
          operatorUserId: userId,
          status: i % 4 === 0 ? 'confirmed' : 'draft',
          observations: `Reserva automática para ${client.fullName}`,
          totalAmount: totalItinAmount,
          isComplete: i % 4 === 0,
          completedAt: i % 4 === 0 ? new Date() : null,
          items: {
            create: itemsToCreate,
          },
        },
      });
    }
  }

  console.log('✅ --- SEED FINALIZADO CON ÉXITO ---');
  console.log(`- Hoteles creados: ${Object.keys(createdHotelsMap).length}`);
  console.log(`- Actividades/Tours creados: ${createdActivities.length}`);
  console.log(`- Clientes registrados: ${createdClients.length}`);
  console.log(`- Horarios generados: ${createdSchedules.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
