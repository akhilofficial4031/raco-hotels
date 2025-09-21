import { type ApiResponse } from "@shared/models";
import { fetcher, mutationFetcher } from "@utils/swrFetcher";

import { type Customer } from "../types/customer";

export type CustomerDetailsResponseData = ApiResponse<CustomerDetailsResponse>;

export interface CustomerDetailsResponse {
  customer: Customer & {
    vipStatus: "regular" | "silver" | "gold" | "platinum";
    preferredPaymentMethod: string | null;
    preferredContactMethod: "email" | "phone" | "sms";
    languagePreference: string;
    timeZone: string | null;
    hasUserAccount: boolean;
    firstBookingSource: string;
  };
  currentBooking?: {
    id: number;
    referenceCode: string;
    hotel: {
      name: string;
    };
    room: {
      roomNumber: string;
      floor: string;
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
      status: "confirmed" | "checkedin" | "checkedout" | "cancelled";
      checkInDate: string;
      checkOutDate: string;
      totalAmountCents: number;
      currencyCode: string;
      createdAt: string;
      numAdults: number;
      numChildren: number;
      items: Array<{
        room_type: {
          name: string;
        };
        room: {
          roomNumber: string;
        };
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
      status: "confirmed" | "checkedin" | "checkedout" | "cancelled";
      checkInDate: string;
      checkOutDate: string;
      totalAmountCents: number;
      currencyCode: string;
      createdAt: string;
      numAdults: number;
      numChildren: number;
      items: Array<{
        room_type: {
          name: string;
        };
        room: {
          roomNumber: string;
        };
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
      status: "confirmed" | "checkedin" | "checkedout" | "cancelled";
      checkInDate: string;
      checkOutDate: string;
      totalAmountCents: number;
      currencyCode: string;
      createdAt: string;
      numAdults: number;
      numChildren: number;
      items: Array<{
        room_type: {
          name: string;
        };
        room: {
          roomNumber: string;
        };
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
      type: "percent" | "fixed";
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
    lastBookingAmountCents: number | null;
    mostVisitedHotel: {
      name: string;
      visits: number;
    } | null;
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

export interface FindCustomerByPhoneResponse {
  success: boolean;
  message: string;
  data: {
    customer: Customer | null;
    found: boolean;
    message: string;
  };
}

/**
 * Search for a customer by phone number
 * @param phone - The phone number to search for
 * @returns Promise containing customer data if found
 */
export const findCustomerByPhone = async (
  phone: string,
): Promise<FindCustomerByPhoneResponse> => {
  return fetcher(`/customers/find-by-phone?phone=${encodeURIComponent(phone)}`);
};

/**
 * Get comprehensive customer details by ID (legacy function - use SWR directly instead)
 * @param customerId - The customer ID to fetch details for
 * @returns Promise containing comprehensive customer details
 */
export const getCustomerDetails = async (
  customerId: string | number,
): Promise<CustomerDetailsResponseData> => {
  return fetcher(`/customers/${customerId}/details`);
};

export const updateCustomerById = async (
  id: string,
  customerData: Partial<Customer>,
): Promise<ApiResponse<Customer>> => {
  return mutationFetcher(`/customers/${id}`, {
    arg: {
      method: "PUT",
      body: customerData,
    },
  });
};

export const deleteCustomer = async (
  id: string,
): Promise<ApiResponse<null>> => {
  return mutationFetcher(`/customers/${id}`, {
    arg: {
      method: "DELETE",
    },
  });
};
