import { type PaginationResponse } from "./common";

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
  taxAmountCents?: number;
  feeAmountCents?: number;
  discountAmountCents?: number;
  balanceDueCents?: number;
  currencyCode: string;
  createdAt: string;
  numAdults?: number;
  numChildren?: number;
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
