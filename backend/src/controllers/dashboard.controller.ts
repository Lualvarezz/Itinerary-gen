import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

function bigintToNumber(val: any): any {
  if (typeof val === 'bigint') return Number(val);
  if (Array.isArray(val)) return val.map(bigintToNumber);
  if (typeof val === 'object' && val !== null) {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      result[k] = bigintToNumber(v);
    }
    return result;
  }
  return val;
}

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
          items: {
            include: {
              activity: true,
              schedule: true,
            },
          },
        },
      }),
    ]);

    const totalValue = recentItineraries.reduce((sum: number, itinerary: any) => sum + Number(itinerary.totalAmount || 0), 0);

    // KPIs Superiores (alias entre comillas para preservar camelCase en PostgreSQL raw query)
    // 1. Tour más vendido (mayor número de reservas e ingresos)
    const topTourData = await prisma.$queryRaw<
      Array<{ activityName: string; reservationCount: number; totalRevenue: number }>
    >`
      SELECT a.name AS "activityName", COUNT(ii.id) AS "reservationCount", COALESCE(SUM(ii.subtotal), 0) AS "totalRevenue"
      FROM "itineraries" i
      JOIN "itinerary_items" ii ON ii."itinerary_id" = i.id
      JOIN "activities" a ON a.id = ii."activity_id"
      GROUP BY a.name
      ORDER BY "reservationCount" DESC, "totalRevenue" DESC
      LIMIT 1
    `;

    // 2. Top Hotel Aliado (hotel con más clientes)
    const topHotelData = await prisma.$queryRaw<
      Array<{ hotelName: string; clientCount: number }>
    >`
      SELECT h.name AS "hotelName", COUNT(c.id) AS "clientCount"
      FROM "clients" c
      JOIN "hotels" h ON h.id = c."hotel_id"
      GROUP BY h.name
      ORDER BY "clientCount" DESC
      LIMIT 1
    `;

    // 3. Principal Canal de Captación/Origen (medio predominante)
    const mainChannelData = await prisma.$queryRaw<
      Array<{ channel: string; count: number }>
    >`
      SELECT "acquisition_channel" AS "channel", COUNT(*) AS "count"
      FROM "clients"
      WHERE "acquisition_channel" IS NOT NULL AND "acquisition_channel" != ''
      GROUP BY "acquisition_channel"
      ORDER BY "count" DESC
      LIMIT 1
    `;

    // 4. Distribución de clientes por hotel (para gráfico de barras)
    const clientsByHotelData = await prisma.$queryRaw<
      Array<{ hotelName: string; clientCount: number; totalRevenue: number }>
    >`
      SELECT h.name AS "hotelName", COUNT(DISTINCT c.id) AS "clientCount", COALESCE(SUM(ii.subtotal), 0) AS "totalRevenue"
      FROM "hotels" h
      LEFT JOIN "clients" c ON c."hotel_id" = h.id
      LEFT JOIN "itineraries" i ON i."client_id" = c.id
      LEFT JOIN "itinerary_items" ii ON ii."itinerary_id" = i.id
      GROUP BY h.name
      ORDER BY "clientCount" DESC
    `;

    // 5. Procedencia/Nacionalidad de turistas (Nacionales vs Extranjeros o Países)
    const nationalityData = await prisma.$queryRaw<
      Array<{ nationality: string; count: number }>
    >`
      SELECT COALESCE(nationality, 'No especificado') AS "nationality", COUNT(*) AS "count"
      FROM "clients"
      GROUP BY nationality
      ORDER BY "count" DESC
    `;

    // 6. Canal de atribución (adquisición)
    const channelData = await prisma.$queryRaw<
      Array<{ channel: string; count: number }>
    >`
      SELECT COALESCE("acquisition_channel", 'Directo') AS "channel", COUNT(*) AS "count"
      FROM "clients"
      GROUP BY "acquisition_channel"
      ORDER BY "count" DESC
    `;

    // 7. Comparativo de horarios / modalidades (variantes de un mismo tour)
    const comparativeData = await prisma.$queryRaw<
      Array<{ activityName: string; schedulePeriod: string; reservationCount: number; totalRevenue: number }>
    >`
      SELECT a.name AS "activityName",
        CASE
          WHEN s."start_time" < '12:00:00' THEN 'Mañana'
          WHEN s."start_time" >= '12:00:00' AND s."start_time" < '18:00:00' THEN 'Tarde'
          ELSE 'Noche'
        END AS "schedulePeriod",
        COUNT(DISTINCT i.id) AS "reservationCount",
        COALESCE(SUM(ii.subtotal), 0) AS "totalRevenue"
      FROM "schedules" s
      JOIN "activities" a ON a.id = s."activity_id"
      JOIN "itinerary_items" ii ON ii."schedule_id" = s.id
      JOIN "itineraries" i ON i.id = ii."itinerary_id"
      GROUP BY a.name, "schedulePeriod"
      ORDER BY "reservationCount" DESC
    `;

    const convertedClientsCount = bigintToNumber(clientsCount);
    const convertedActivitiesCount = bigintToNumber(activitiesCount);
    const convertedItinerariesCount = bigintToNumber(itinerariesCount);
    const convertedSchedulesCount = bigintToNumber(schedulesCount);
    const convertedRecentItineraries = bigintToNumber(recentItineraries);
    const convertedTopTour = bigintToNumber(topTourData)[0] || null;
    const convertedTopHotel = bigintToNumber(topHotelData)[0] || null;
    const convertedMainChannel = bigintToNumber(mainChannelData)[0] || null;
    const convertedClientsByHotel = bigintToNumber(clientsByHotelData);
    const convertedNationalityDistribution = bigintToNumber(nationalityData);
    const convertedChannelDistribution = bigintToNumber(channelData);
    const convertedComparativeModalities = bigintToNumber(comparativeData);

    res.status(200).json({
      clientsCount: convertedClientsCount,
      activitiesCount: convertedActivitiesCount,
      itinerariesCount: convertedItinerariesCount,
      schedulesCount: convertedSchedulesCount,
      totalValue,
      recentItineraries: convertedRecentItineraries,
      topTour: convertedTopTour,
      topHotel: convertedTopHotel,
      mainChannel: convertedMainChannel,
      clientsByHotel: convertedClientsByHotel,
      nationalityDistribution: convertedNationalityDistribution,
      channelDistribution: convertedChannelDistribution,
      comparativeModalities: convertedComparativeModalities,
    });
  } catch (error) {
    next(error);
  }
};
