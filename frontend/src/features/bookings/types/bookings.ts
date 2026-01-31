import { type PaginationResponse } from "@shared/models/common";

export interface Booking {
  id: number;
  referenceCode: string;
  hotelId: number;
  hotelName?: string;
  customerName?: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalAmountCents: number;
  amountPaidCents?: number;
  roomPriceCents?: number;
  taxAmountCents?: number;
  feeAmountCents?: number;
  discountAmountCents?: number;
  balanceDueCents?: number;
  currencyCode: string;
  createdAt: string;
  numAdults?: number;
  numChildren?: number;
  notes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundAmountCents?: number;
  hotel?: {
    id: number;
    name: string;
  } | null;
  customer?: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
    alternatePhone?: string | null;
    nationality?: string | null;
    idType?: string | null;
    idNumber?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    notes?: string | null;
  } | null;
  items?: any[];
  addons?: any[];
  promotions?: any[];
}

export interface BookingListResponse {
  success: boolean;
  data: {
    bookings: Booking[];
    pagination: PaginationResponse;
  };
}

export interface BookingListParamStructure {
  page: number;
  limit: number;
  query?: string;
  status?: string;
  hotelId?: string;
  checkInDateStart?: string;
  checkInDateEnd?: string;
}

export interface CancelBookingRequest {
  refundAmountCents?: number;
  cancellationReason?: string;
}
