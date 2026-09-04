import { prisma } from '../lib/prisma.js';
import { getValidUserId } from '../utils/userHelper.js';

export class ClientRepository {
  async list() {
    const clients = await prisma.client.findMany({
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            address: true,
            zone: true,
            sector: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return clients.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      documentNumber: c.documentNumber,
      email: c.email,
      phone: c.phone,
      nationality: c.nationality,
      numberOfPeople: c.numberOfPeople,
      observations: c.observations,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      createdByUserId: c.createdByUserId,
      hotelId: c.hotelId,
      roomNumber: c.roomNumber,
      hotel: c.hotel ? {
        id: c.hotel.id,
        name: c.hotel.name,
        address: c.hotel.address,
        zone: c.hotel.zone,
        sector: c.hotel.sector,
      } : null,
    }));
  }

  async create(data: {
    fullName: string;
    documentNumber: string;
    email?: string | null;
    phone?: string | null;
    nationality: string;
    numberOfPeople: number;
    observations?: string | null;
    hotelId?: number | null;
    roomNumber?: string | null;
    createdByUserId: string;
  }) {
    const validUserId = await getValidUserId(data.createdByUserId);
    const { hotelId, roomNumber, ...rest } = data;
    return prisma.client.create({
      data: {
        ...rest,
        ...(hotelId ? { hotelId: Number(hotelId) } : {}),
        ...(roomNumber ? { roomNumber } : {}),
        createdByUserId: validUserId,
      },
      include: {
        hotel: true,
      },
    });
  }

  async findById(id: number) {
    return prisma.client.findUnique({
      where: { id },
      include: { hotel: true },
    });
  }

  async update(id: number, data: Record<string, unknown>) {
    const payload: Record<string, unknown> = { ...data };
    if ('hotelId' in payload) {
      payload.hotelId = payload.hotelId ? Number(payload.hotelId) : null;
    }
    return prisma.client.update({
      where: { id },
      data: payload,
      include: { hotel: true },
    });
  }

  async delete(id: number) {
    return prisma.client.delete({ where: { id } });
  }
}
