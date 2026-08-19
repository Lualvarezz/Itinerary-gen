import type { Request, Response, NextFunction } from 'express';
import { CatalogService } from '../services/catalog.service.js';

const catalogService = new CatalogService();

export const listCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await catalogService.listCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await catalogService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const listTouristPlaces = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const places = await catalogService.listTouristPlaces();
    res.status(200).json(places);
  } catch (error) {
    next(error);
  }
};

export const createTouristPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const place = await catalogService.createTouristPlace(req.body);
    res.status(201).json(place);
  } catch (error) {
    next(error);
  }
};

export const listActivities = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const activities = await catalogService.listActivities();
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await catalogService.createActivity({
      ...req.body,
      createdByUserId: req.user?.id || 'system',
    });
    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activity = await catalogService.updateActivity(Number(req.params.id), req.body);
    res.status(200).json(activity);
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await catalogService.deleteActivity(Number(req.params.id));
    res.status(200).json({ message: 'Actividad eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};
