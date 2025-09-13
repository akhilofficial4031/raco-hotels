import { z } from "zod";

export const DashboardStatsSchema = z.object({
  totalHotels: z.number().int().min(0),
  totalRooms: z.number().int().min(0),
  totalBookings: z.number().int().min(0),
});

export const YearlyBookingsSchema = z.array(z.number().int().min(0)).length(12);
