import { type ApiResponse } from "@shared/models/common";

export interface DashboardStats {
  totalHotels: number;
  totalRooms: number;
  totalBookings: number;
}

export interface YearlyBookings {
  months: string[];
  bookings: number[];
}

export type DashboardStatsResponse = ApiResponse<DashboardStats>;
export type YearlyBookingsResponse = ApiResponse<number[]>;
