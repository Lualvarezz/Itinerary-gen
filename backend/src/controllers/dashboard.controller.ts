import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export const getDashboardSummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [clientsCount, activitiesCount, itinerariesCount, schedulesCount, recentItineraries] = await Promise.all([
      prisma.client.count(),
      prisma.activity.count(),
      prisma.itinerary.count(),
      prisma.schedule.count(),
      prisma.itinerary.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          items: true,
        },
      }),
    ]);

    const totalValue = recentItineraries.reduce((sum, itinerary) => sum + Number(itinerary.totalAmount || 0), 0);

    res.status(200).json({
      clientsCount,
      activitiesCount,
      itinerariesCount,
      schedulesCount,
      totalValue,
      recentItineraries,
    });
  } catch (error) {
    next(error);
  }
};
