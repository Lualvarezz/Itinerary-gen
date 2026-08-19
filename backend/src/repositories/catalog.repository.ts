import { prisma } from '../lib/prisma.js';

export class CatalogRepository {
  async listCategories() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(data: { name: string; description?: string | null }) {
    return prisma.category.create({ data });
  }

  async listTouristPlaces() {
    return prisma.touristPlace.findMany({ orderBy: { name: 'asc' } });
  }

  async createTouristPlace(data: { name: string; description?: string | null; city: string; location?: string | null; imageUrl?: string | null }) {
    return prisma.touristPlace.create({ data });
  }

  async listActivities() {
    return prisma.activity.findMany({
      include: {
        category: true,
        touristPlace: true,
        schedules: {
          orderBy: { scheduleDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createActivity(data: {
    name: string;
    description?: string | null;
    price: number;
    durationMinutes: number;
    touristPlaceId: number;
    categoryId: number;
    imageUrl?: string | null;
    createdByUserId: string;
  }) {
    return prisma.activity.create({
      data: {
        ...data,
        price: data.price,
      },
      include: { category: true, touristPlace: true, schedules: true },
    });
  }

  async updateActivity(id: number, data: {
    name?: string;
    description?: string | null;
    price?: number;
    durationMinutes?: number;
    touristPlaceId?: number;
    categoryId?: number;
    imageUrl?: string | null;
  }) {
    return prisma.activity.update({
      where: { id },
      data,
      include: { category: true, touristPlace: true, schedules: true },
    });
  }

  async deleteActivity(id: number) {
    // Verificar si tiene horarios con reservas
    const schedules = await prisma.schedule.findMany({
      where: { activityId: id },
      include: { itineraryItems: true },
    });

    const hasReservations = schedules.some((s) => (s.itineraryItems || []).length > 0);
    if (hasReservations) {
      throw new Error('No se puede eliminar la actividad porque tiene horarios con reservas en itinerarios');
    }

    // Eliminar horarios asociados primero si no tienen reservas
    await prisma.schedule.deleteMany({
      where: { activityId: id },
    });

    return prisma.activity.delete({
      where: { id },
    });
  }
}
