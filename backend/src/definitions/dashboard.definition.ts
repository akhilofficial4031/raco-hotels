import { createRoute, ApiTags } from "../lib/route-wrapper";
import { DashboardStatsSchema, YearlyBookingsSchema } from "../schemas";

export const DashboardRouteDefinitions = {
  getStats: createRoute({
    method: "get",
    path: "/dashboard/stats",
    summary: "Get dashboard stats",
    description: "Get total hotels, rooms, and bookings.",
    tags: [ApiTags.DASHBOARD],
    successSchema: DashboardStatsSchema,
    successDescription: "Dashboard stats retrieved successfully",
    includeBadRequest: true,
  }),

  getYearlyBookings: createRoute({
    method: "get",
    path: "/dashboard/yearly-bookings",
    summary: "Get yearly bookings",
    description: "Get total bookings for each month of the current year.",
    tags: [ApiTags.DASHBOARD],
    successSchema: YearlyBookingsSchema,
    successDescription: "Yearly bookings retrieved successfully",
    includeBadRequest: true,
  }),
};
