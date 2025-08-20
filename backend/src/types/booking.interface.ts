import type {
  BaseEntity,
  HotelScopedEntity,
  BookingStatus,
  MonetaryAmount,
} from "./common.interface";

/**
 * Database representation of a booking
 */
export interface DatabaseBooking extends HotelScopedEntity {
  referenceCode: string;
  userId: number | null;
  customerId: number | null; // For direct customer bookings
  adminId: number | null; // Admin who created the booking (for direct bookings)
  roomTypeId: number;
  roomId: number | null;
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  petsCount: number;
  currencyCode: string;
  status: BookingStatus;
  amounts: MonetaryAmount;
  specialRequests: string | null;
  contactEmail: string;
  contactPhone: string | null;
  promoCode: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
}

/**
 * Data required to create a new booking
 */
export interface CreateBookingData {
  referenceCode: string;
  hotelId: number;
  userId?: number | null;
  customerId?: number | null; // For direct customer bookings
  adminId?: number | null; // Admin who created the booking
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  petsCount?: number;
  currencyCode: string;
  contactEmail?: string;
  contactPhone?: string | null;
  specialRequests?: string | null;
  promoCode?: string | null;
  amounts: MonetaryAmount;
}

/**
 * Data that can be updated for a booking
 */
export interface UpdateBookingData
  extends Partial<Omit<CreateBookingData, "referenceCode" | "hotelId">> {
  status?: BookingStatus;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
}
