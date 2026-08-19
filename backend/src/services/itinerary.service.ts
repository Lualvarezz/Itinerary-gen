import { HttpError } from '../utils/httpError.js';
import { ItineraryRepository } from '../repositories/itinerary.repository.js';

export class ItineraryService {
  constructor(private readonly itineraryRepository = new ItineraryRepository()) {}

  async list() {
    return this.itineraryRepository.list();
  }

  async getById(id: number) {
    const itinerary = await this.itineraryRepository.getById(id);
    if (!itinerary) {
      throw new HttpError(404, 'Itinerario no encontrado');
    }
    return itinerary;
  }

  async create(input: {
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
    if (!input.clientId) {
      throw new HttpError(400, 'El cliente es obligatorio');
    }

    const normalizedStatus = input.status === 'confirmed' ? 'confirmed' : 'draft';
    const normalizedOperatorUserId = input.operatorUserId && input.operatorUserId.length > 0
      ? input.operatorUserId
      : '11111111-1111-1111-1111-111111111111';

    return this.itineraryRepository.create({
      clientId: Number(input.clientId),
      operatorUserId: normalizedOperatorUserId,
      observations: input.observations ?? null,
      status: normalizedStatus,
      items: input.items,
    });
  }

  async update(id: number, input: {
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
    return this.itineraryRepository.update(id, {
      ...input,
      clientId: input.clientId ? Number(input.clientId) : undefined,
    });
  }

  async delete(id: number) {
    return this.itineraryRepository.deleteItinerary(id);
  }

  async addItem(input: {
    itineraryId: number;
    activityId: number;
    scheduleId: number;
    quantityPeople: number;
    unitPrice: number;
    subtotal: number;
  }) {
    return this.itineraryRepository.addItem(input);
  }

  async listSchedules() {
    return this.itineraryRepository.listSchedules();
  }

  async createSchedule(input: {
    activityId: number;
    scheduleDate: string;
    startTime: string;
    endTime: string;
    capacity: number;
    createdByUserId: string;
  }) {
    return this.itineraryRepository.createSchedule(input);
  }

  async updateSchedule(id: number, input: {
    scheduleDate?: string;
    startTime?: string;
    endTime?: string;
    capacity?: number;
    status?: string;
  }) {
    return this.itineraryRepository.updateSchedule(id, input);
  }

  async deleteSchedule(id: number) {
    return this.itineraryRepository.deleteSchedule(id);
  }

  async confirmAndGeneratePdf(id: number) {
    const itinerary = await this.itineraryRepository.getById(id);
    if (!itinerary) {
      throw new HttpError(404, 'Itinerario no encontrado');
    }

    const updated = await this.itineraryRepository.confirmPdf(id);
    return updated;
  }
}
