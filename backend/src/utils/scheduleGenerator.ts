import { prisma } from '../lib/prisma.js';

/**
 * Generates and ensures schedule coverage for all active activities
 * covering the remainder of 2026 and the entire year 2027.
 * Existing schedules, reservations, and available slots are strictly preserved.
 */
export async function ensureScheduleCoverage() {
  try {
    const activities = await prisma.activity.findMany({
      where: { status: 'available' },
    });

    if (activities.length === 0) return;

    const adminUser = await prisma.user.findFirst();
    const userId = adminUser?.id || '11111111-1111-1111-1111-111111111111';

    // Cover remaining 2026 (from 2026-11-01) and all of 2027 (through 2027-12-31)
    const startDate = new Date('2026-11-01T00:00:00.000Z');
    const endDate = new Date('2027-12-31T23:59:59.999Z');

    // Pre-fetch all existing schedules within this window
    const existingSchedules = await prisma.schedule.findMany({
      where: {
        scheduleDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        activityId: true,
        scheduleDate: true,
      },
    });

    const existingMap = new Set<string>();
    for (const s of existingSchedules) {
      const dStr = s.scheduleDate.toISOString().split('T')[0];
      existingMap.add(`${s.activityId}_${dStr}`);
    }

    const newSchedulesToInsert: Array<{
      activityId: number;
      scheduleDate: Date;
      startTime: Date;
      endTime: Date;
      capacity: number;
      availableSlots: number;
      status: string;
      createdByUserId: string;
    }> = [];

    for (const act of activities) {
      const isMorning =
        act.durationMinutes >= 300 ||
        act.name.toLowerCase().includes('mañana') ||
        act.name.toLowerCase().includes('vip') ||
        act.name.toLowerCase().includes('pasadía');
      const isSunset =
        act.name.toLowerCase().includes('atardecer') ||
        act.name.toLowerCase().includes('tarde');
      const isNight =
        act.name.toLowerCase().includes('nocturna') ||
        act.name.toLowerCase().includes('noche') ||
        act.name.toLowerCase().includes('chiva') ||
        act.name.toLowerCase().includes('fantasmas');

      const startTimeStr = isMorning ? '08:30:00' : isSunset ? '16:30:00' : isNight ? '20:00:00' : '09:00:00';
      const endTimeStr = isMorning ? '16:30:00' : isSunset ? '19:00:00' : isNight ? '22:30:00' : '12:30:00';

      const cur = new Date(startDate);
      while (cur <= endDate) {
        const dateStr = cur.toISOString().split('T')[0];
        const key = `${act.id}_${dateStr}`;

        if (!existingMap.has(key)) {
          const scheduleDate = new Date(`${dateStr}T00:00:00.000Z`);
          const startTime = new Date(`1970-01-01T${startTimeStr}Z`);
          const endTime = new Date(`1970-01-01T${endTimeStr}Z`);

          newSchedulesToInsert.push({
            activityId: act.id,
            scheduleDate,
            startTime,
            endTime,
            capacity: 25,
            availableSlots: 25,
            status: 'available',
            createdByUserId: userId,
          });
        }

        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    }

    if (newSchedulesToInsert.length > 0) {
      // Chunk insertions for database performance
      const chunkSize = 200;
      for (let i = 0; i < newSchedulesToInsert.length; i += chunkSize) {
        const chunk = newSchedulesToInsert.slice(i, i + chunkSize);
        await prisma.schedule.createMany({
          data: chunk,
        });
      }
      console.log(`[ScheduleGenerator] Successfully generated ${newSchedulesToInsert.length} schedules covering 2026-2027.`);
    }
  } catch (error) {
    console.error('[ScheduleGenerator] Error ensuring schedule coverage:', error);
  }
}
