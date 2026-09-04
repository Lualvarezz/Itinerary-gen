function bigintToNumber(val: any) {
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

    const totalValue = recentItineraries.reduce((sum, itinerary) => sum + Number(itinerary.totalAmount || 0), 0);

// KPIs Superiores
    // 1. Tour más vendido (mayor número de reservas e ingresos)
    const topTourData = await prisma.$queryRaw<
      Array<{ activityName: string; reservationCount: number; totalRevenue: number }>
    >`
      SELECT a.name AS activityName, COUNT(ii.id) AS reservationCount, SUM(ii.subtotal) AS totalRevenue
      FROM "itineraries" i
      JOIN "itinerary_items" ii ON ii."itinerary_id" = i.id
      JOIN "activities" a ON a.id = ii."activity_id"
      GROUP BY a.name
      ORDER BY reservationCount DESC, totalRevenue DESC
      LIMIT 1
    `;

    // 2. Top Hotel Aliado (hotel con más clientes)
    const topHotelData = await prisma.$queryRaw<
      Array<{ hotelName: string; clientCount: number }>
    >`
      SELECT h.name AS hotelName, COUNT(c.id) AS clientCount
      FROM "clients" c
      JOIN "hotels" h ON h.id = c."hotel_id"
      GROUP BY h.name
      ORDER BY clientCount DESC
      LIMIT 1
    `;

    // 3. Principal Canal de Capta/Origen (medio predominante)
    const mainChannelData = await prisma.$queryRaw<
      Array<{ channel: string; count: number }>
    >`
SELECT "acquisition_channel" AS channel, COUNT(*) AS count
      FROM "clients"
      GROUP BY "acquisition_channel"
      ORDER BY count DESC
    `;

    // 4. Distribución de clientes por hotel (para gráfico de barras)
    const clientsByHotelData = await prisma.$queryRaw<
      Array<{ hotelName: string; clientCount: number; totalRevenue: number }>
    >`
      SELECT h.name AS hotelName, COUNT(DISTINCT c.id) AS clientCount, COALESCE(SUM(ii.subtotal), 0) AS totalRevenue
      FROM "clients" c
      JOIN "hotels" h ON h.id = c."hotel_id"
      LEFT JOIN "itineraries" i ON i."client_id" = c.id
      LEFT JOIN "itinerary_items" ii ON ii."itinerary_id" = i.id
      GROUP BY h.name
      ORDER BY clientCount DESC
    `;

    // 5. Procedencia/Nacionalidad de turistas (Nacionales vs Extranjeros)
    const nationalityData = await prisma.$queryRaw<
      Array<{ nationality: string; count: number }>
    >`
      SELECT nationality, COUNT(*) AS count
      FROM "clients"
      GROUP BY nationality
      ORDER BY count DESC
    `;

    // 6. Canal de atribución (adquisición)
    const channelData = await prisma.$queryRaw<
      Array<{ channel: string; count: number }>
    >`
      SELECT "acquisition_channel" AS channel, COUNT(*) AS count
      FROM "clients"
      GROUP BY "acquisition_channel"
      ORDER BY count DESC
    `;

    // 7. Comparativo de horarios / modalidades (variantes de un mismo tour)
    const comparativeData = await prisma.$queryRaw<
      Array<{ activityName: string; schedulePeriod: string; count: number; totalRevenue: number }>
    >`
      SELECT a.name AS activityName,
        CASE
          WHEN s."start_time" < '12:00:00' THEN 'Mañana'
          WHEN s."start_time" >= '12:00:00' AND s."start_time" < '18:00:00' THEN 'Tarde'
          ELSE 'Noche'
        END AS schedulePeriod,
        COUNT(DISTINCT i.id) AS reservationCount,
        COALESCE(SUM(ii.subtotal), 0) AS totalRevenue
      FROM "schedules" s
      JOIN "activities" a ON a.id = s."activity_id"
      JOIN "itinerary_items" ii ON ii."schedule_id" = s.id
      JOIN "itineraries" i ON i.id = ii."itinerary_id"
      GROUP BY a.name, schedulePeriod
      ORDER BY a.name, schedulePeriod
    `;

    const convertedClientsCount = bigintToNumber(clientsCount);
    const convertedActivitiesCount = bigintToNumber(activitiesCount);
    const convertedItinerariesCount = bigintToNumber(itinerariesCount);
    const convertedSchedulesCount = bigintToNumber(schedulesCount);
    const convertedRecentItineraries = bigintToNumber(recentItineraries);
    const convertedTopTour = bigintToNumber(topTourData)[0] || { activityName: 'N/A', reservationCount: 0, totalRevenue: 0 };
    const convertedTopHotel = bigintToNumber(topHotelData)[0] || { hotelName: 'N/A', clientCount: 0 };
    const convertedMainChannel = bigintToNumber(mainChannelData)[0] || { channel: 'N/A', count: 0 };
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
      // Nuevos KPIs y datos para gráficos
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
