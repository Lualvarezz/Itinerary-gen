import { HttpError } from '../utils/httpError.js';
import { CatalogRepository } from '../repositories/catalog.repository.js';
import { createActivitySchema, updateActivitySchema } from '../schemas/catalog.schema.js';

export class CatalogService {
  constructor(private readonly catalogRepository = new CatalogRepository()) {}

  async listCategories() {
    return this.catalogRepository.listCategories();
  }

  async createCategory(input: { name: string; description?: string | null }) {
    return this.catalogRepository.createCategory(input);
  }

  async listTouristPlaces() {
    return this.catalogRepository.listTouristPlaces();
  }

  async createTouristPlace(input: { name: string; description?: string | null; city: string; location?: string | null; imageUrl?: string | null }) {
    return this.catalogRepository.createTouristPlace(input);
  }

  async listActivities() {
    return this.catalogRepository.listActivities();
  }

  async createActivity(input: {
    name: string;
    description?: string | null;
    price: number;
    durationMinutes: number;
    touristPlaceId: number;
    categoryId: number;
    imageUrl?: string | null;
    createdByUserId: string;
  }) {
    const validated = createActivitySchema.safeParse(input);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || 'Datos de actividad inválidos';
      throw new HttpError(400, firstError);
    }

    return this.catalogRepository.createActivity({
      ...validated.data,
      createdByUserId: input.createdByUserId || 'system',
    });
  }

  async updateActivity(id: number, input: {
    name?: string;
    description?: string | null;
    price?: number;
    durationMinutes?: number;
    touristPlaceId?: number;
    categoryId?: number;
    imageUrl?: string | null;
  }) {
    const validated = updateActivitySchema.safeParse(input);
    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || 'Datos de actividad inválidos';
      throw new HttpError(400, firstError);
    }

    return this.catalogRepository.updateActivity(id, validated.data);
  }

  async deleteActivity(id: number) {
    return this.catalogRepository.deleteActivity(id);
  }
}
