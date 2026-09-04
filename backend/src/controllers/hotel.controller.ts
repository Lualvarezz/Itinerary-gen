import type { Request, Response, NextFunction } from 'express';
import { HotelService } from '../services/hotel.service.js';

const hotelService = new HotelService();

export const listHotels = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await hotelService.list();
    res.status(200).json(hotels);
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotel = await hotelService.create({
      ...req.body,
      userId: req.user?.id || 'system',
    });
    res.status(201).json(hotel);
  } catch (error) {
    next(error);
  }
};
