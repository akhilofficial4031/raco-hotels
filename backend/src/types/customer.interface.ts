import { z } from "zod";

import {
  CreateCustomerRequestSchema,
  UpdateCustomerRequestSchema,
  CustomerSearchQuerySchema,
} from "../schemas";

export type CreateCustomerData = z.infer<typeof CreateCustomerRequestSchema>;
export type UpdateCustomerData = z.infer<typeof UpdateCustomerRequestSchema>;
export type CustomerSearchFilters = z.infer<typeof CustomerSearchQuerySchema>;

export interface CustomerWithBookingStats extends DatabaseCustomer {
  totalBookings: number;
  totalSpentCents: number;
  lastBookingAt: string | null;
}

export interface CustomerBookingHistory {
  customerId: number;
  bookings: Array<{
    id: number;
    referenceCode: string;
    hotelName: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
    totalAmountCents: number;
    currencyCode: string;
    createdAt: string;
  }>;
  totalBookings: number;
  totalSpentCents: number;
}

export interface CustomerDetailsResponse {
  customer: {
    id: number;
    email: string;
    fullName: string;
    phone?: string | null;
    alternatePhone?: string | null;
    dateOfBirth?: string | null;
    gender?: "male" | "female" | "other" | null;
    nationality?: string | null;
    idType?: string | null;
    idNumber?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
    dietaryPreferences?: string[] | null;
    specialRequests?: string[] | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    loyaltyNumber?: string | null;
    marketingOptIn: boolean;
    status: "active" | "inactive" | "blocked";
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    lastBookingAt?: string | null;
    totalBookings: number;
    totalSpentCents: number;
    vipStatus?: "regular" | "silver" | "gold" | "platinum" | null;
    preferredPaymentMethod?: string | null;
    preferredContactMethod?: "email" | "phone" | "sms" | null;
    languagePreference?: string | null;
    timeZone?: string | null;
    hasUserAccount: boolean;
    firstBookingSource:
      | "web"
      | "front_office"
      | "phone"
      | "email"
      | "mobile_app"
      | "walk_in";
  };
  currentBooking?: {
    id: number;
    referenceCode: string;
    hotel: {
      name: string;
    };
    room: {
      roomNumber: string;
      floor?: string;
    };
    checkInDate: string;
    checkOutDate: string;
    status: string;
  };
  bookingHistory: {
    past: Array<{
      id: number;
      referenceCode: string;
      hotel: { id: number; name: string };
      status: string;
      checkInDate: string;
      checkOutDate: string;
      totalAmountCents: number;
      currencyCode: string;
      createdAt: string;
      numAdults: number;
      numChildren: number;
      items: Array<{
        room_type: { name: string };
        room: { roomNumber: string };
      }>;
      payments: Array<{
        amountCents: number;
        status: string;
        method: string;
        createdAt: string;
      }>;
    }>;
    active: Array<{
      id: number;
      referenceCode: string;
      hotel: { id: number; name: string };
      status: string;
      checkInDate: string;
      checkOutDate: string;
      totalAmountCents: number;
      currencyCode: string;
      createdAt: string;
      numAdults: number;
      numChildren: number;
      items: Array<{
        room_type: { name: string };
        room: { roomNumber: string };
      }>;
      payments: Array<{
        amountCents: number;
        status: string;
        method: string;
        createdAt: string;
      }>;
    }>;
    future: Array<{
      id: number;
      referenceCode: string;
      hotel: { id: number; name: string };
      status: string;
      checkInDate: string;
      checkOutDate: string;
      totalAmountCents: number;
      currencyCode: string;
      createdAt: string;
      numAdults: number;
      numChildren: number;
      items: Array<{
        room_type: { name: string };
        room: { roomNumber: string };
      }>;
      payments: Array<{
        amountCents: number;
        status: string;
        method: string;
        createdAt: string;
      }>;
    }>;
  };
  promoUsage: Array<{
    id: string;
    promoCode: {
      code: string;
      type: string;
      value: number;
    };
    booking: {
      referenceCode: string;
      totalAmountCents: number;
      currencyCode: string;
    };
    amountCents: number;
    usedAt: string;
  }>;
  spendingAnalytics: {
    totalSpentCents: number;
    averageBookingValueCents: number;
    lastBookingAmountCents: number;
    mostVisitedHotel: {
      name: string;
      visits: number;
    };
    spendingByHotel: Array<{
      hotelName: string;
      totalSpentCents: number;
      bookingCount: number;
    }>;
    monthlySpending: Array<{
      month: string;
      amountCents: number;
    }>;
  };
  paymentHistory: Array<{
    id: number;
    bookingReference: string;
    amountCents: number;
    currencyCode: string;
    status: string;
    method: string;
    processor: string;
    createdAt: string;
  }>;
}
