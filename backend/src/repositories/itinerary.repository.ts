import { prisma } from '../lib/prisma.js';

export class ItineraryRepository {
  async list() {
    return prisma.itinerary.findMany({
      include: {
        client: true,
        operator: true,
        items: {
          include: {
            activity: true,
            schedule: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: number) {
    const rows = await prisma.$queryRaw<Array<{
      id: bigint;
      client_id: bigint;
      operator_user_id: string;
      created_at: Date;
      status: string;
      observations: string | null;
      total_amount: bigint | number;
      is_complete: boolean;
      completed_at: Date | null;
      updated_at: Date;
      client_full_name: string;
      client_document_number: string;
      operator_full_name: string;
      operator_email: string;
    }>>`
      SELECT i.id, i.client_id, i.operator_user_id, i.created_at, i.status, i.observations, i.total_amount, i.is_complete, i.completed_at, i.updated_at,
             c.full_name as client_full_name,
             c.document_number as client_document_number,
             u.full_name as operator_full_name,
             u.email as operator_email
      FROM itineraries i
      LEFT JOIN clients c ON c.id = i.client_id
      LEFT JOIN users u ON u.id = i.operator_user_id
      WHERE i.id = ${id}
      LIMIT 1
    `;

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      id: Number(row.id),
      clientId: Number(row.client_id),
      operatorUserId: row.operator_user_id,
      createdAt: row.created_at,
      status: row.status,
      observations: row.observations,
      totalAmount: Number(row.total_amount),
      isComplete: row.is_complete,
      completedAt: row.completed_at,
      updatedAt: row.updated_at,
      client: {
        fullName: row.client_full_name,
        documentNumber: row.client_document_number,
      },
      operator: {
        fullName: row.operator_full_name,
        email: row.operator_email,
      },
      items: [],
    };
  }

  async create(data: {
    clientId: number;
    operatorUserId: string;
    observations?: string | null;
    status?: string;
  }) {
    const result = await prisma.$queryRaw<{ id: bigint }[]>`
      INSERT INTO itineraries (client_id, operator_user_id, observations, total_amount, is_complete, status, created_at, updated_at)
      VALUES (${data.clientId}, ${data.operatorUserId}::uuid, ${data.observations ?? null}, 0, false, ${data.status === 'confirmed' ? 'confirmed' : 'draft'}::itinerary_status, NOW(), NOW())
      RETURNING id
    `;

    const createdId = result[0]?.id;

    if (!createdId) {
      throw new Error('No se pudo crear el itinerario');
    }

    const rows = await prisma.$queryRaw<Array<{ id: number; client_id: number; operator_user_id: string; created_at: Date; status: string; observations: string | null; total_amount: number; is_complete: boolean; completed_at: Date | null; updated_at: Date; client_full_name: string; client_document_number: string; operator_full_name: string; operator_email: string }>>`
      SELECT i.id, i.client_id, i.operator_user_id, i.created_at, i.status, i.observations, i.total_amount, i.is_complete, i.completed_at, i.updated_at,
             c.full_name as client_full_name,
             c.document_number as client_document_number,
             u.full_name as operator_full_name,
             u.email as operator_email
      FROM itineraries i
      LEFT JOIN clients c ON c.id = i.client_id
      LEFT JOIN users u ON u.id = i.operator_user_id
      WHERE i.id = ${Number(createdId)}
      LIMIT 1
    `;

    const row = rows[0];
    if (!row) {
      throw new Error('No se pudo recuperar el itinerario');
    }

    return {
      id: Number(row.id),
      clientId: Number(row.client_id),
      operatorUserId: row.operator_user_id,
      createdAt: row.created_at,
      status: row.status,
      observations: row.observations,
      totalAmount: row.total_amount,
      isComplete: row.is_complete,
      completedAt: row.completed_at,
      updatedAt: row.updated_at,
      client: {
        fullName: row.client_full_name,
        documentNumber: row.client_document_number,
      },
      operator: {
        fullName: row.operator_full_name,
        email: row.operator_email,
      },
      items: [],
    };
  }

  async update(id: number, data: { clientId?: number; observations?: string | null; status?: string }) {
    return prisma.itinerary.update({
      where: { id },
      data: {
        clientId: data.clientId,
        observations: data.observations ?? undefined,
        status: data.status,
      },
      include: { client: true, operator: true },
    });
  }

  async addItem(data: {
    itineraryId: number;
    activityId: number;
    scheduleId: number;
    quantityPeople: number;
    unitPrice: number;
    subtotal: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const createdItem = await tx.itineraryItem.create({ data });
      const currentItems = await tx.itineraryItem.findMany({ where: { itineraryId: data.itineraryId } });
      const totalAmount = currentItems.reduce((sum, item) => sum + Number(item.subtotal), 0);

      await tx.itinerary.update({
        where: { id: data.itineraryId },
        data: { totalAmount },
      });

      return createdItem;
    });
  }

  async listSchedules() {
    return prisma.schedule.findMany({
      include: { activity: true },
      orderBy: { scheduleDate: 'asc' },
    });
  }

  async confirmPdf(id: number) {
    await prisma.$executeRaw`
      UPDATE itineraries
      SET status = 'confirmed'::itinerary_status,
          updated_at = NOW(),
          is_complete = true,
          completed_at = NOW()
      WHERE id = ${id}
    `;

    return this.getById(id);
  }

  async createSchedule(data: {
    activityId: number;
    scheduleDate: string;
    startTime: string;
    endTime: string;
    capacity: number;
    availableSlots: number;
    createdByUserId: string;
  }) {
    return prisma.schedule.create({ data });
  }
}
