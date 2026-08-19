import { HttpError } from '../utils/httpError.js';
import { ItineraryRepository } from '../repositories/itinerary.repository.js';

export class ItineraryService {
  constructor(private readonly itineraryRepository = new ItineraryRepository()) {}

  async list() {
    return this.itineraryRepository.list();
  }

  async create(input: {
    clientId: number;
    operatorUserId: string;
    observations?: string | null;
    status?: string;
  }) {
    if (!input.clientId) {
      throw new HttpError(400, 'El cliente es obligatorio');
    }

    const normalizedStatus = input.status === 'confirmed' ? 'confirmed' : 'draft';
    const normalizedOperatorUserId = input.operatorUserId && input.operatorUserId.length > 0
      ? input.operatorUserId
      : '11111111-1111-1111-1111-111111111111';

    return this.itineraryRepository.create({
      clientId: input.clientId,
      operatorUserId: normalizedOperatorUserId,
      observations: input.observations ?? null,
      status: normalizedStatus,
    });
  }

  async update(id: number, input: { clientId?: number; observations?: string | null; status?: string }) {
    if (input.clientId && !input.clientId) {
      throw new HttpError(400, 'El cliente es obligatorio');
    }

    const normalizedStatus = input.status === 'confirmed' ? 'confirmed' : 'draft';

    return this.itineraryRepository.update(id, {
      ...input,
      status: normalizedStatus,
    });
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
    availableSlots: number;
    createdByUserId: string;
  }) {
    return this.itineraryRepository.createSchedule(input);
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
