import type { Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/client.service.js';

const clientService = new ClientService();

export const listClients = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await clientService.list();
    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = {
      ...req.body,
      createdByUserId: req.user?.id || 'system',
    };
    const client = await clientService.create(payload);
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const client = await clientService.update(id, req.body);
    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await clientService.remove(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
