import { prisma } from '../lib/prisma.js';
import { getValidUserId } from '../utils/userHelper.js';

export class ClientRepository {
  async list() {
    const rows = await prisma.$queryRaw<Array<{
      id: bigint;
      full_name: string;
      document_number: string;
      email: string | null;
      phone: string | null;
      nationality: string;
      number_of_people: number;
      observations: string | null;
      status: string;
      created_at: Date;
      updated_at: Date;
      created_by_user_id: string;
    }>>`
      SELECT id, full_name, document_number, email, phone, nationality, number_of_people, observations, status, created_at, updated_at, created_by_user_id
      FROM clients
      ORDER BY created_at DESC
    `;

    return rows.map((row) => ({
      id: Number(row.id),
      fullName: row.full_name,
      documentNumber: row.document_number,
      email: row.email,
      phone: row.phone,
      nationality: row.nationality,
      numberOfPeople: Number(row.number_of_people),
      observations: row.observations,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdByUserId: row.created_by_user_id,
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
    createdByUserId: string;
  }) {
    const validUserId = await getValidUserId(data.createdByUserId);
    return prisma.client.create({
      data: {
        ...data,
        createdByUserId: validUserId,
      },
    });
  }

  async findById(id: number) {
    return prisma.client.findUnique({ where: { id } });
  }

  async update(id: number, data: Record<string, unknown>) {
    return prisma.client.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.client.delete({ where: { id } });
  }
}
