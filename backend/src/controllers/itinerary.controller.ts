import type { Request, Response, NextFunction } from 'express';
import { ItineraryService } from '../services/itinerary.service.js';
import { generateItineraryPdf } from '../utils/pdfGenerator.js';

const itineraryService = new ItineraryService();

export const listItineraries = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const itineraries = await itineraryService.list();
    res.status(200).json(itineraries);
  } catch (error) {
    next(error);
  }
};

export const createItinerary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operatorUserId = req.user?.id && req.user.id.length > 0 ? req.user.id : '11111111-1111-1111-1111-111111111111';
    const itinerary = await itineraryService.create({
      clientId: Number(req.body.clientId),
      observations: req.body.observations ?? null,
      status: req.body.status,
      operatorUserId,
    });
    res.status(201).json(itinerary);
  } catch (error) {
    next(error);
  }
};

export const updateItinerary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itinerary = await itineraryService.update(Number(req.params.id), req.body);
    res.status(200).json(itinerary);
  } catch (error) {
    next(error);
  }
};

export const addItineraryItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await itineraryService.addItem({
      ...req.body,
      itineraryId: Number(req.params.id),
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const listSchedules = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const schedules = await itineraryService.listSchedules();
    res.status(200).json(schedules);
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schedule = await itineraryService.createSchedule({
      ...req.body,
      createdByUserId: req.user?.id || 'system',
    });
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
};

export const generateItineraryPdfController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itinerary = await itineraryService.confirmAndGeneratePdf(Number(req.params.id));
    if (!itinerary) {
      res.status(404).json({ message: 'Itinerario no encontrado' });
      return;
    }

    const normalizedItinerary = {
      ...itinerary,
      id: Number(itinerary.id),
      totalAmount: Number(itinerary.totalAmount || 0),
      items: (itinerary.items || []).map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice || 0),
        subtotal: Number(item.subtotal || 0),
      })),
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="itinerario-${itinerary.id}.pdf"`);
    res.status(200).send(generateItineraryPdf(normalizedItinerary));
  } catch (error) {
    next(error);
  }
};
