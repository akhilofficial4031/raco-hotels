export interface DatabaseCustomer {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  alternatePhone?: string | null;
  dateOfBirth?: string | null; // YYYY-MM-DD format
  gender?: "male" | "female" | "other" | null;
  nationality?: string | null;
  idType?: string | null;
  idNumber?: string | null;

  // Address fields
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;

  // Preferences and notes
  dietaryPreferences?: string | null; // JSON string
  specialRequests?: string | null; // JSON string
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  // Loyalty and marketing
  loyaltyNumber?: string | null;
  marketingOptIn: number; // 0 = no, 1 = yes

  // System fields
  status: "active" | "inactive" | "blocked";
  notes?: string | null;
  firstBookingSource:
    | "web"
    | "front_office"
    | "phone"
    | "email"
    | "mobile_app"
    | "walk_in";
  preferredPaymentMethod: string | null;
  vipStatus: "regular" | "silver" | "gold" | "platinum" | null;
  preferredContactMethod: "email" | "phone" | "sms" | null;
  languagePreference: string | null;
  timeZone: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastBookingAt: string | null;
  lastContactAt: string | null;
}

export interface CreateCustomerData {
  email: string;
  fullName: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string; // YYYY-MM-DD format
  gender?: "male" | "female" | "other";
  nationality?: string;
  idType?: string;
  idNumber?: string;

  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Preferences and notes
  dietaryPreferences?: string[]; // Will be converted to JSON string
  specialRequests?: string[]; // Will be converted to JSON string
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Loyalty and marketing
  loyaltyNumber?: string;
  marketingOptIn?: boolean; // Will be converted to 0/1

  // System fields
  source?: "web" | "front_office" | "phone" | "email" | "mobile_app";
  status?: "active" | "inactive" | "blocked";
  notes?: string;
  firstBookingSource?:
    | "web"
    | "front_office"
    | "phone"
    | "email"
    | "mobile_app"
    | "walk_in";
  preferredPaymentMethod?: string;
  vipStatus?: "regular" | "silver" | "gold" | "platinum";
  preferredContactMethod?: "email" | "phone" | "sms";
  languagePreference?: string;
  timeZone?: string;
}

export interface UpdateCustomerData extends CreateCustomerData {
  id: number;
}

export interface CustomerSearchFilters {
  email?: string;
  fullName?: string;
  phone?: string;
  status?: "active" | "inactive" | "blocked";
  source?: "web" | "front_office" | "phone" | "email" | "mobile_app";
  createdAfter?: string;
  createdBefore?: string;
  hasBookings?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "id" | "fullName" | "email" | "createdAt" | "lastBookingAt";
  sortOrder?: "asc" | "desc";
  firstBookingSource?:
    | "web"
    | "front_office"
    | "phone"
    | "email"
    | "mobile_app"
    | "walk_in";
  vipStatus?: "regular" | "silver" | "gold" | "platinum";
}

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
