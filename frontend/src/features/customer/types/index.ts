export interface CustomerBooking {
  id: number;
  referenceCode: string;
  hotel: {
    id: number;
    name: string;
  };
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
}

export interface CustomerPromoUsage {
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
}

export interface CustomerDetailsData {
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
    dietaryPreferences?: string[];
    specialRequests?: string[];
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
    past: CustomerBooking[];
    active: CustomerBooking[];
    future: CustomerBooking[];
  };
  promoUsage: CustomerPromoUsage[];
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
