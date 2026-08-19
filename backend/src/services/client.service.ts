import { HttpError } from '../utils/httpError.js';
import { ClientRepository } from '../repositories/client.repository.js';

export class ClientService {
  constructor(private readonly clientRepository = new ClientRepository()) {}

  async list() {
    return this.clientRepository.list();
  }

  async create(input: {
    fullName: string;
    documentNumber: string;
    email?: string | null;
    phone?: string | null;
    nationality: string;
    numberOfPeople: number;
    observations?: string | null;
    createdByUserId: string;
  }) {
    return this.clientRepository.create(input);
  }

  async update(id: number, input: Record<string, unknown>) {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new HttpError(404, 'Cliente no encontrado');
    }

    return this.clientRepository.update(id, input);
  }

  async remove(id: number) {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new HttpError(404, 'Cliente no encontrado');
    }

    return this.clientRepository.delete(id);
  }
}
