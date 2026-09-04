import { HotelRepository } from '../repositories/hotel.repository.js';
import { HttpError } from '../utils/httpError.js';

export class HotelService {
  constructor(private readonly hotelRepository = new HotelRepository()) {}

  async list() {
    return this.hotelRepository.list();
  }

  async create(input: {
    name: string;
    address?: string | null;
    zone?: string | null;
    sector?: string | null;
    contactPhone?: string | null;
    commissionRate?: number;
    userId: string;
  }) {
    if (!input.name) {
      throw new HttpError(400, 'El nombre del hotel es requerido');
    }
    try {
      return await this.hotelRepository.create(input);
    } catch (err: any) {
      throw new HttpError(400, err.message || 'Error al crear hotel');
    }
  }
}
