import { z } from "zod";

// Base customer schema
export const CustomerBaseSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(255, "Full name too long"),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  nationality: z.string().max(100, "Nationality too long").optional(),
  idType: z.string().max(50, "ID type too long").optional(),
  idNumber: z.string().max(100, "ID number too long").optional(),

  // Address fields
  addressLine1: z.string().max(255, "Address line 1 too long").optional(),
  addressLine2: z.string().max(255, "Address line 2 too long").optional(),
  city: z.string().max(100, "City name too long").optional(),
  state: z.string().max(100, "State name too long").optional(),
  country: z.string().max(100, "Country name too long").optional(),
  postalCode: z.string().max(20, "Postal code too long").optional(),

  // Preferences and notes
  dietaryPreferences: z.array(z.string()).optional(),
  specialRequests: z.array(z.string()).optional(),
  emergencyContactName: z
    .string()
    .max(255, "Emergency contact name too long")
    .optional(),
  emergencyContactPhone: z
    .string()
    .max(20, "Emergency contact phone too long")
    .optional(),

  // Loyalty and marketing
  loyaltyNumber: z.string().max(50, "Loyalty number too long").optional(),
  marketingOptIn: z.boolean().optional(),

  // System fields
  firstBookingSource: z
    .enum(["web", "front_office", "phone", "email", "mobile_app", "walk_in"])
    .optional(),
  status: z.enum(["active", "inactive", "blocked"]).optional(),
  notes: z.string().optional(),
  hasUserAccount: z.boolean().optional(),

  // Customer analytics and tracking
  preferredPaymentMethod: z
    .string()
    .max(50, "Payment method too long")
    .optional(),
  vipStatus: z.enum(["regular", "silver", "gold", "platinum"]).optional(),

  // Communication preferences
  preferredContactMethod: z.enum(["email", "phone", "sms"]).optional(),
  languagePreference: z.string().max(10, "Language code too long").optional(),
  timeZone: z.string().max(50, "Timezone too long").optional(),
});

// Create customer schema
export const CreateCustomerRequestSchema = CustomerBaseSchema;

// Update customer schema
export const UpdateCustomerRequestSchema = CustomerBaseSchema.partial().extend({
  id: z.number().int().positive("Customer ID must be a positive integer"),
});

// Customer path params schema
export const CustomerPathParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Customer ID must be a number")
    .transform(Number),
});

// Customer search/filter schema
export const CustomerSearchQuerySchema = z.object({
  search: z.string().optional(),
  email: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive", "blocked"]).optional(),
  firstBookingSource: z
    .enum(["web", "front_office", "phone", "email", "mobile_app", "walk_in"])
    .optional(),
  vipStatus: z.enum(["regular", "silver", "gold", "platinum"]).optional(),
  createdAfter: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  createdBefore: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  hasBookings: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z
    .enum(["id", "fullName", "email", "createdAt", "lastBookingAt"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const CustomerListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
});

export const CustomerListItemSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  vipStatus: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
});

export const CustomersListResponseSchema = z.object({
  customers: z.array(CustomerListItemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Customer response schemas
export const CustomerResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  alternatePhone: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  gender: z.enum(["male", "female", "other"]).nullable(),
  nationality: z.string().nullable(),
  idType: z.string().nullable(),
  idNumber: z.string().nullable(),

  // Address fields
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  country: z.string().nullable(),
  postalCode: z.string().nullable(),

  // Preferences and notes
  dietaryPreferences: z.array(z.string()).nullable(),
  specialRequests: z.array(z.string()).nullable(),
  emergencyContactName: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),

  // Loyalty and marketing
  loyaltyNumber: z.string().nullable(),
  marketingOptIn: z.boolean(),

  // System fields
  firstBookingSource: z.enum([
    "web",
    "front_office",
    "phone",
    "email",
    "mobile_app",
    "walk_in",
  ]),
  status: z.enum(["active", "inactive", "blocked"]),
  notes: z.string().nullable(),

  // Web user tracking
  hasUserAccount: z.boolean(),

  // Customer analytics and tracking
  totalBookings: z.number(),
  totalSpentCents: z.number(),
  preferredPaymentMethod: z.string().nullable(),
  vipStatus: z.enum(["regular", "silver", "gold", "platinum"]).nullable(),

  // Communication preferences
  preferredContactMethod: z.enum(["email", "phone", "sms"]).nullable(),
  languagePreference: z.string().nullable(),
  timeZone: z.string().nullable(),

  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
  lastBookingAt: z.string().nullable(),
  lastContactAt: z.string().nullable(),
});

export const CustomerWithStatsResponseSchema = CustomerResponseSchema;

export const CustomerBookingHistoryResponseSchema = z.object({
  customerId: z.number(),
  bookings: z.array(
    z.object({
      id: z.number(),
      referenceCode: z.string(),
      hotelName: z.string(),
      checkInDate: z.string(),
      checkOutDate: z.string(),
      status: z.string(),
      totalAmountCents: z.number(),
      currencyCode: z.string(),
      createdAt: z.string(),
    }),
  ),
  totalBookings: z.number(),
  totalSpentCents: z.number(),
});

export const CustomerSearchResponseSchema = z.object({
  customers: z.array(CustomerWithStatsResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Find customer by email schema
export const FindCustomerByEmailQuerySchema = z.object({
  email: z.string().email("Invalid email format"),
  includeBookingData: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export const FindCustomerByEmailResponseSchema = z.object({
  customer: CustomerWithStatsResponseSchema.nullable(),
  found: z.boolean(),
});

// Find customer by phone schema
export const FindCustomerByPhoneQuerySchema = z.object({
  phone: z.string(),
});

export const FindCustomerByPhoneResponseSchema = z.object({
  customer: CustomerResponseSchema.nullable(),
  found: z.boolean(),
});

// Customer details response schema
export const CustomerDetailsResponseSchema = z.object({
  customer: z.object({
    id: z.number(),
    email: z.string(),
    fullName: z.string(),
    phone: z.string().nullable(),
    alternatePhone: z.string().nullable(),
    dateOfBirth: z.string().nullable(),
    gender: z.enum(["male", "female", "other"]).nullable(),
    nationality: z.string().nullable(),
    idType: z.string().nullable(),
    idNumber: z.string().nullable(),
    addressLine1: z.string().nullable(),
    addressLine2: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    country: z.string().nullable(),
    postalCode: z.string().nullable(),
    dietaryPreferences: z.array(z.string()).nullable(),
    specialRequests: z.array(z.string()).nullable(),
    emergencyContactName: z.string().nullable(),
    emergencyContactPhone: z.string().nullable(),
    loyaltyNumber: z.string().nullable(),
    marketingOptIn: z.boolean(),
    status: z.enum(["active", "inactive", "blocked"]),
    notes: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    lastBookingAt: z.string().nullable(),
    totalBookings: z.number(),
    totalSpentCents: z.number(),
    vipStatus: z.enum(["regular", "silver", "gold", "platinum"]).nullable(),
    preferredPaymentMethod: z.string().nullable(),
    preferredContactMethod: z.enum(["email", "phone", "sms"]).nullable(),
    languagePreference: z.string().nullable(),
    timeZone: z.string().nullable(),
    hasUserAccount: z.boolean(),
    firstBookingSource: z.enum([
      "web",
      "front_office",
      "phone",
      "email",
      "mobile_app",
      "walk_in",
    ]),
  }),
  currentBooking: z
    .object({
      id: z.number(),
      referenceCode: z.string(),
      hotel: z.object({
        name: z.string(),
      }),
      room: z.object({
        roomNumber: z.string(),
        floor: z.string().optional(),
      }),
      checkInDate: z.string(),
      checkOutDate: z.string(),
      status: z.string(),
    })
    .optional(),
  bookingHistory: z.object({
    past: z.array(
      z.object({
        id: z.number(),
        referenceCode: z.string(),
        hotel: z.object({
          id: z.number(),
          name: z.string(),
        }),
        status: z.string(),
        checkInDate: z.string(),
        checkOutDate: z.string(),
        totalAmountCents: z.number(),
        currencyCode: z.string(),
        createdAt: z.string(),
        numAdults: z.number(),
        numChildren: z.number(),
        items: z.array(
          z.object({
            room_type: z.object({
              name: z.string(),
            }),
            room: z.object({
              roomNumber: z.string(),
            }),
          }),
        ),
        payments: z.array(
          z.object({
            amountCents: z.number(),
            status: z.string(),
            method: z.string(),
            createdAt: z.string(),
          }),
        ),
      }),
    ),
    active: z.array(
      z.object({
        id: z.number(),
        referenceCode: z.string(),
        hotel: z.object({
          id: z.number(),
          name: z.string(),
        }),
        status: z.string(),
        checkInDate: z.string(),
        checkOutDate: z.string(),
        totalAmountCents: z.number(),
        currencyCode: z.string(),
        createdAt: z.string(),
        numAdults: z.number(),
        numChildren: z.number(),
        items: z.array(
          z.object({
            room_type: z.object({
              name: z.string(),
            }),
            room: z.object({
              roomNumber: z.string(),
            }),
          }),
        ),
        payments: z.array(
          z.object({
            amountCents: z.number(),
            status: z.string(),
            method: z.string(),
            createdAt: z.string(),
          }),
        ),
      }),
    ),
    future: z.array(
      z.object({
        id: z.number(),
        referenceCode: z.string(),
        hotel: z.object({
          id: z.number(),
          name: z.string(),
        }),
        status: z.string(),
        checkInDate: z.string(),
        checkOutDate: z.string(),
        totalAmountCents: z.number(),
        currencyCode: z.string(),
        createdAt: z.string(),
        numAdults: z.number(),
        numChildren: z.number(),
        items: z.array(
          z.object({
            room_type: z.object({
              name: z.string(),
            }),
            room: z.object({
              roomNumber: z.string(),
            }),
          }),
        ),
        payments: z.array(
          z.object({
            amountCents: z.number(),
            status: z.string(),
            method: z.string(),
            createdAt: z.string(),
          }),
        ),
      }),
    ),
  }),
  promoUsage: z.array(
    z.object({
      id: z.string(),
      promoCode: z.object({
        code: z.string(),
        type: z.string(),
        value: z.number(),
      }),
      booking: z.object({
        referenceCode: z.string(),
        totalAmountCents: z.number(),
        currencyCode: z.string(),
      }),
      amountCents: z.number(),
      usedAt: z.string(),
    }),
  ),
  spendingAnalytics: z.object({
    totalSpentCents: z.number(),
    averageBookingValueCents: z.number(),
    lastBookingAmountCents: z.number(),
    mostVisitedHotel: z.object({
      name: z.string(),
      visits: z.number(),
    }),
    spendingByHotel: z.array(
      z.object({
        hotelName: z.string(),
        totalSpentCents: z.number(),
        bookingCount: z.number(),
      }),
    ),
    monthlySpending: z.array(
      z.object({
        month: z.string(),
        amountCents: z.number(),
      }),
    ),
  }),
  paymentHistory: z.array(
    z.object({
      id: z.number(),
      bookingReference: z.string(),
      amountCents: z.number(),
      currencyCode: z.string(),
      status: z.string(),
      method: z.string(),
      processor: z.string(),
      createdAt: z.string(),
    }),
  ),
});
