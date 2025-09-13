import { DashboardRepository } from "../repositories/dashboard.repository";

export class DashboardService {
  static async getStats(db: D1Database) {
    return await DashboardRepository.getStats(db);
  }

  static async getYearlyBookings(db: D1Database) {
    return await DashboardRepository.getYearlyBookings(db);
  }
}
