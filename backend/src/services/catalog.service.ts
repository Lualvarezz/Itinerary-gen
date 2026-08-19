import { HttpError } from '../utils/httpError.js';
import { CatalogRepository } from '../repositories/catalog.repository.js';

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
    if (!input.touristPlaceId || !input.categoryId) {
      throw new HttpError(400, 'Lugar turístico y categoría son obligatorios');
    }

    return this.catalogRepository.createActivity(input);
  }
}
