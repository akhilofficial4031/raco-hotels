import { handleAsyncRoute, DashboardResponse } from "../lib/responses";
import { DashboardService } from "../services/dashboard.service";

import type { AppContext } from "../types";

export class DashboardController {
  static async getStats(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const stats = await DashboardService.getStats(c.env.DB);
        return DashboardResponse.statsRetrieved(c, stats);
      },
      "operation.fetchDashboardStatsFailed",
    );
  }

  static async getYearlyBookings(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const yearlyBookings = await DashboardService.getYearlyBookings(
          c.env.DB,
        );
        return DashboardResponse.yearlyBookingsRetrieved(c, yearlyBookings);
      },
      "operation.fetchDashboardYearlyBookingsFailed",
    );
  }
}
