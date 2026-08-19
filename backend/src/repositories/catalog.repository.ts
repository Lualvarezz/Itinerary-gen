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
      include: { category: true, touristPlace: true },
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
      include: { category: true, touristPlace: true },
    });
  }
}
