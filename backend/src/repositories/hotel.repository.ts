import { prisma } from '../lib/prisma.js';

export class HotelRepository {
  async list() {
    return prisma.hotel.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
      take: 20,
    });
  }

  async findById(id: number) {
    return prisma.hotel.findUnique({ where: { id } });
  }

  async create(data: {
    name: string;
    address?: string | null;
    zone?: string | null;
    sector?: string | null;
    contactPhone?: string | null;
    commissionRate?: number;
    userId: string;
  }) {
    const currentCount = await prisma.hotel.count();
    if (currentCount >= 20) {
      throw new Error('No se pueden crear más de 20 hoteles en el sistema.');
    }
    return prisma.hotel.create({
      data: {
        ...data,
        commissionRate: data.commissionRate ?? 10.0,
      },
    });
  }
}
