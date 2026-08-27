import { prisma } from '../lib/prisma.js';
import { getValidUserId } from '../utils/userHelper.js';

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
    return prisma.itinerary.findUnique({
      where: { id },
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
    });
  }

  async create(data: {
    clientId: number;
    operatorUserId: string;
    observations?: string | null;
    status?: string;
    items?: Array<{
      activityId: number;
      scheduleId: number;
      quantityPeople: number;
      unitPrice: number;
      subtotal: number;
    }>;
  }) {
    const validOperatorId = await getValidUserId(data.operatorUserId);
    return prisma.$transaction(async (tx) => {
      const normalizedStatus = data.status === 'confirmed' ? 'confirmed' : 'draft';
      const items = data.items || [];
      const totalAmount = items.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0);

      // 1. Validar y descontar cupos para cada actividad/horario
      for (const item of items) {
        const schedule = await tx.schedule.findUnique({
          where: { id: item.scheduleId },
        });

        if (!schedule) {
          throw new Error(`Horario con ID ${item.scheduleId} no encontrado`);
        }

        if (schedule.availableSlots < item.quantityPeople) {
          throw new Error(`No hay cupos suficientes para el horario del ${schedule.scheduleDate.toISOString().split('T')[0]}. Disponibles: ${schedule.availableSlots}, solicitados: ${item.quantityPeople}`);
        }

        const newAvailable = Math.max(0, schedule.availableSlots - item.quantityPeople);
        await tx.schedule.update({
          where: { id: item.scheduleId },
          data: {
            availableSlots: newAvailable,
            status: newAvailable === 0 ? 'complete' : 'available',
          },
        });
      }

      // 2. Crear el itinerario
      const createdItinerary = await tx.itinerary.create({
        data: {
          clientId: data.clientId,
          operatorUserId: validOperatorId,
          observations: data.observations ?? null,
          status: normalizedStatus,
          totalAmount,
          isComplete: normalizedStatus === 'confirmed',
          completedAt: normalizedStatus === 'confirmed' ? new Date() : null,
          items: {
            create: items.map((it) => ({
              activityId: it.activityId,
              scheduleId: it.scheduleId,
              quantityPeople: it.quantityPeople,
              unitPrice: it.unitPrice,
              subtotal: it.subtotal,
            })),
          },
        },
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
      });

      return createdItinerary;
    });
  }

  async update(id: number, data: {
    clientId?: number;
    observations?: string | null;
    status?: string;
    items?: Array<{
      activityId: number;
      scheduleId: number;
      quantityPeople: number;
      unitPrice: number;
      subtotal: number;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.itinerary.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        throw new Error('Itinerario no encontrado');
      }

      // Si se envían items, restaurar cupos de los items anteriores y aplicar los nuevos
      if (data.items !== undefined) {
        for (const oldItem of existing.items) {
          const schedule = await tx.schedule.findUnique({ where: { id: oldItem.scheduleId } });
          if (schedule) {
            const restoredSlots = Math.min(schedule.capacity, schedule.availableSlots + oldItem.quantityPeople);
            await tx.schedule.update({
              where: { id: oldItem.scheduleId },
              data: {
                availableSlots: restoredSlots,
                status: 'available',
              },
            });
          }
        }

        // Eliminar items previos
        await tx.itineraryItem.deleteMany({ where: { itineraryId: id } });

        // Aplicar y descontar nuevos items
        for (const newItem of data.items) {
          const schedule = await tx.schedule.findUnique({ where: { id: newItem.scheduleId } });
          if (!schedule) {
            throw new Error(`Horario con ID ${newItem.scheduleId} no encontrado`);
          }
          if (schedule.availableSlots < newItem.quantityPeople) {
            throw new Error(`No hay cupos suficientes para el horario del ${schedule.scheduleDate.toISOString().split('T')[0]}. Disponibles: ${schedule.availableSlots}, solicitados: ${newItem.quantityPeople}`);
          }

          const newAvailable = Math.max(0, schedule.availableSlots - newItem.quantityPeople);
          await tx.schedule.update({
            where: { id: newItem.scheduleId },
            data: {
              availableSlots: newAvailable,
              status: newAvailable === 0 ? 'complete' : 'available',
            },
          });
        }
      }

      const items = data.items !== undefined ? data.items : existing.items;
      const totalAmount = items.reduce((sum: number, it: any) => sum + (Number(it.subtotal) || 0), 0);
      const normalizedStatus = data.status === 'confirmed' ? 'confirmed' : (data.status || existing.status);

      return tx.itinerary.update({
        where: { id },
        data: {
          clientId: data.clientId ?? existing.clientId,
          observations: data.observations !== undefined ? data.observations : existing.observations,
          status: normalizedStatus,
          totalAmount,
          isComplete: normalizedStatus === 'confirmed',
          completedAt: normalizedStatus === 'confirmed' ? (existing.completedAt || new Date()) : null,
          ...(data.items !== undefined ? {
            items: {
              create: data.items.map((it) => ({
                activityId: it.activityId,
                scheduleId: it.scheduleId,
                quantityPeople: it.quantityPeople,
                unitPrice: it.unitPrice,
                subtotal: it.subtotal,
              })),
            },
          } : {}),
        },
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
      });
    });
  }

  async deleteItinerary(id: number) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.itinerary.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        throw new Error('Itinerario no encontrado');
      }

      // Restaurar cupos a los horarios
      for (const item of existing.items) {
        const schedule = await tx.schedule.findUnique({ where: { id: item.scheduleId } });
        if (schedule) {
          const restoredSlots = Math.min(schedule.capacity, schedule.availableSlots + item.quantityPeople);
          await tx.schedule.update({
            where: { id: item.scheduleId },
            data: {
              availableSlots: restoredSlots,
              status: 'available',
            },
          });
        }
      }

      return tx.itinerary.delete({
        where: { id },
      });
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
      const schedule = await tx.schedule.findUnique({
        where: { id: data.scheduleId },
      });

      if (!schedule) {
        throw new Error('El horario seleccionado no existe');
      }

      if (schedule.availableSlots < data.quantityPeople) {
        throw new Error(`No hay cupos suficientes. Disponibles: ${schedule.availableSlots}, solicitados: ${data.quantityPeople}`);
      }

      const createdItem = await tx.itineraryItem.create({ data });

      const newAvailable = Math.max(0, schedule.availableSlots - data.quantityPeople);
      await tx.schedule.update({
        where: { id: data.scheduleId },
        data: {
          availableSlots: newAvailable,
          status: newAvailable === 0 ? 'complete' : 'available',
        },
      });

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
    createdByUserId: string;
  }) {
    const validUserId = await getValidUserId(data.createdByUserId);
    const formattedStartTime = data.startTime.includes(':') && data.startTime.split(':').length === 2 ? `${data.startTime}:00` : data.startTime;
    const formattedEndTime = data.endTime.includes(':') && data.endTime.split(':').length === 2 ? `${data.endTime}:00` : data.endTime;

    return prisma.schedule.create({
      data: {
        activityId: data.activityId,
        scheduleDate: new Date(data.scheduleDate),
        startTime: new Date(`1970-01-01T${formattedStartTime}Z`),
        endTime: new Date(`1970-01-01T${formattedEndTime}Z`),
        capacity: Number(data.capacity),
        availableSlots: Number(data.capacity),
        status: 'available',
        createdByUserId: validUserId,
      },
    });
  }

  async updateSchedule(id: number, data: {
    scheduleDate?: string;
    startTime?: string;
    endTime?: string;
    capacity?: number;
    status?: string;
  }) {
    const existing = await prisma.schedule.findUnique({
      where: { id },
      include: { itineraryItems: true },
    });

    if (!existing) {
      throw new Error('Horario no encontrado');
    }

    const totalBooked = (existing.itineraryItems || []).reduce(
      (sum, item) => sum + item.quantityPeople,
      0
    );

    const newCapacity = data.capacity !== undefined ? Number(data.capacity) : existing.capacity;
    if (newCapacity < totalBooked) {
      throw new Error(`La capacidad no puede ser menor a los cupos ya ocupados en itinerarios (${totalBooked} personas reservadas)`);
    }

    const newAvailable = newCapacity - totalBooked;

    const formattedStartTime = data.startTime ? (data.startTime.includes(':') && data.startTime.split(':').length === 2 ? `${data.startTime}:00` : data.startTime) : undefined;
    const formattedEndTime = data.endTime ? (data.endTime.includes(':') && data.endTime.split(':').length === 2 ? `${data.endTime}:00` : data.endTime) : undefined;

    return prisma.schedule.update({
      where: { id },
      data: {
        ...(data.scheduleDate ? { scheduleDate: new Date(data.scheduleDate) } : {}),
        ...(formattedStartTime ? { startTime: new Date(`1970-01-01T${formattedStartTime}Z`) } : {}),
        ...(formattedEndTime ? { endTime: new Date(`1970-01-01T${formattedEndTime}Z`) } : {}),
        ...(data.capacity !== undefined ? { capacity: newCapacity } : {}),
        availableSlots: newAvailable,
        status: newAvailable === 0 ? 'complete' : (data.status || existing.status),
      },
    });
  }

  async deleteSchedule(id: number) {
    const items = await prisma.itineraryItem.findMany({
      where: { scheduleId: id },
    });

    if (items.length > 0) {
      throw new Error('No se puede eliminar este horario porque ya está asignado a uno o más itinerarios');
    }

    return prisma.schedule.delete({
      where: { id },
    });
  }
}
