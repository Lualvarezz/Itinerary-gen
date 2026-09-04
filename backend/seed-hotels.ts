import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const REAL_CARTAGENA_HOTELS = [
  {
    name: 'Sofitel Legend Santa Clara',
    address: 'Calle del Torno # 39-29',
    zone: 'Centro Histórico',
    sector: 'San Diego',
    contactPhone: '+57 605 650 4700',
    commissionRate: 10.00,
  },
  {
    name: 'Hotel Charleston Santa Teresa',
    address: 'Carrera 3 # 31-23, Plaza Santa Teresa',
    zone: 'Centro Histórico',
    sector: 'Plaza Santa Teresa',
    contactPhone: '+57 605 664 9494',
    commissionRate: 12.00,
  },
  {
    name: 'Hotel Casa San Agustín',
    address: 'Calle de la Universidad # 36-44',
    zone: 'Centro Histórico',
    sector: 'Centro',
    contactPhone: '+57 605 681 0000',
    commissionRate: 10.00,
  },
  {
    name: 'Hotel Bantu Boutique',
    address: 'Calle de la Tablada # 7-62',
    zone: 'Centro Histórico',
    sector: 'San Diego',
    contactPhone: '+57 605 664 2661',
    commissionRate: 10.00,
  },
  {
    name: 'Selina Getsemaní',
    address: 'Calle del Arsenal # 10-41',
    zone: 'Getsemaní',
    sector: 'Calle del Arsenal',
    contactPhone: '+57 605 693 0590',
    commissionRate: 8.00,
  },
  {
    name: 'Hotel GDM Getsemaní',
    address: 'Calle del Guerrero # 29-57',
    zone: 'Getsemaní',
    sector: 'Calle del Guerrero',
    contactPhone: '+57 605 660 8484',
    commissionRate: 10.00,
  },
  {
    name: 'Hotel Casa Lola Deluxe Gallery',
    address: 'Calle del Guerrero # 29-108',
    zone: 'Getsemaní',
    sector: 'Calle del Guerrero',
    contactPhone: '+57 605 664 1530',
    commissionRate: 10.00,
  },
  {
    name: 'Hyatt Regency Cartagena',
    address: 'Carrera 1 # 12-118',
    zone: 'Bocagrande',
    sector: 'Carrera 1',
    contactPhone: '+57 605 694 1234',
    commissionRate: 10.00,
  },
  {
    name: 'Hotel Estelar Bocagrande',
    address: 'Carrera 1 # 11-116',
    zone: 'Bocagrande',
    sector: 'Carrera 1',
    contactPhone: '+57 605 651 7800',
    commissionRate: 10.00,
  },
  {
    name: 'Hotel Las Américas',
    address: 'Anillo Vial, Sector Cielo Mar',
    zone: 'Zona Norte',
    sector: 'Cielo Mar',
    contactPhone: '+57 605 656 7000',
    commissionRate: 12.00,
  },
  {
    name: 'Hotel Decameron Barú',
    address: 'Isla Barú, Sector Portonaito',
    zone: 'Zona Insular',
    sector: 'Isla Barú',
    contactPhone: '+57 605 693 2000',
    commissionRate: 15.00,
  },
  {
    name: 'Hilton Cartagena',
    address: 'Avenida San Martín, El Laguito',
    zone: 'Bocagrande',
    sector: 'El Laguito',
    contactPhone: '+57 605 694 5000',
    commissionRate: 10.00,
  },
  {
    name: 'Hotel San Pedro Claver',
    address: 'Plaza San Pedro Claver # 31-19',
    zone: 'Centro Histórico',
    sector: 'Centro',
    contactPhone: '+57 605 664 4920',
    commissionRate: 10.00,
  },
  {
    name: 'Hotel Movich Cartagena de Indias',
    address: 'Calle de la Ascensión # 36-09',
    zone: 'Centro Histórico',
    sector: 'Centro',
    contactPhone: '+57 605 660 0185',
    commissionRate: 10.00,
  },
  {
    name: 'Hotel Ermita Cartagena, a Tribute Portfolio',
    address: 'Calle Real del El Cabrero # 41-55',
    zone: 'El Cabrero',
    sector: 'El Cabrero',
    contactPhone: '+57 605 654 3210',
    commissionRate: 10.00,
  },
];

async function seedHotels() {
  console.log('Seeding hotels in Cartagena (max 20)...');
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No user found in database.');
  }

  // Check current hotel count
  const existingHotels = await prisma.hotel.findMany();
  const existingNames = new Set(existingHotels.map((h) => h.name.toLowerCase()));

  let count = existingHotels.length;
  console.log(`Current hotels in DB: ${count}`);

  for (const h of REAL_CARTAGENA_HOTELS) {
    if (existingNames.has(h.name.toLowerCase())) {
      // Update details if address/phone missing
      const match = existingHotels.find((ex) => ex.name.toLowerCase() === h.name.toLowerCase());
      if (match) {
        await prisma.hotel.update({
          where: { id: match.id },
          data: {
            address: h.address,
            zone: h.zone,
            sector: h.sector,
            contactPhone: h.contactPhone,
          },
        });
      }
    } else {
      if (count >= 20) {
        console.log('Limit of 20 hotels reached. Skipping additional creations.');
        break;
      }
      await prisma.hotel.create({
        data: {
          ...h,
          userId: user.id,
          status: 'active',
        },
      });
      count++;
    }
  }

  const finalCount = await prisma.hotel.count();
  console.log(`Final hotel count in DB: ${finalCount} (enforced limit <= 20)`);
}

seedHotels()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
