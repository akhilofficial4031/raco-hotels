import { and, count, gte, lte, sql } from "drizzle-orm";

import { booking } from "../../drizzle/schema/booking";
import { hotel } from "../../drizzle/schema/hotel";
import { room } from "../../drizzle/schema/room_unit";
import { getDb } from "../db";

export class DashboardRepository {
  static async getStats(db: D1Database) {
    const database = getDb(db);
    const totalHotels = await database.select({ value: count() }).from(hotel);
    const totalRooms = await database.select({ value: count() }).from(room);
    const totalBookings = await database
      .select({ value: count() })
      .from(booking);

    return {
      totalHotels: totalHotels[0].value,
      totalRooms: totalRooms[0].value,
      totalBookings: totalBookings[0].value,
    };
  }

  static async getYearlyBookings(db: D1Database) {
    const database = getDb(db);
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1).toISOString();
    const endDate = new Date(
      currentYear,
      11,
      31,
      23,
      59,
      59,
      999,
    ).toISOString();

    const monthlyBookings = await database
      .select({
        month: sql<string>`strftime('%m', ${booking.createdAt})`,
        count: count(booking.id),
      })
      .from(booking)
      .where(
        and(gte(booking.createdAt, startDate), lte(booking.createdAt, endDate)),
      )
      .groupBy(sql`strftime('%m', ${booking.createdAt})`)
      .orderBy(sql`strftime('%m', ${booking.createdAt})`);

    const bookingsByMonth = Array(12).fill(0);
    monthlyBookings.forEach((item) => {
      if (item.month !== null) {
        const monthIndex = parseInt(item.month, 10) - 1;
        if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
          bookingsByMonth[monthIndex] = item.count;
        }
      }
    });

    return bookingsByMonth;
  }
}
