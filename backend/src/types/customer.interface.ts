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
  source: "web" | "front_office" | "phone" | "email" | "mobile_app";
  status: "active" | "inactive" | "blocked";
  notes?: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastBookingAt?: string | null;
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
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
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
}

export interface CustomerWithBookingStats extends DatabaseCustomer {
  totalBookings: number;
  totalSpentCents: number;
  lastBookingDate?: string | null;
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
