import { type PaginationResponse } from "./common";

export interface Customer {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  alternatePhone: string | null;
  dateOfBirth: string | null;
  gender: "male" | "female" | "other";
  nationality: string | null;
  idType: string | null;
  idNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  dietaryPreferences: string[];
  specialRequests: string[];
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  loyaltyNumber: string | null;
  marketingOptIn: boolean;
  source: "web" | "phone" | "walk-in" | "other";
  status: "active" | "inactive" | "blocked";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastBookingAt: string | null;
  totalBookings: number;
  totalSpentCents: number;
  lastBookingDate: string | null;
}

export interface CustomerListParam {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "blocked";
  source?: "web" | "phone" | "walk-in" | "other";
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: PaginationResponse;
}

export interface CreateCustomerPayload {
  email: string;
  fullName: string;
  phone: string;
  alternatePhone?: string | null;
  dateOfBirth?: string | null;
  gender?: "male" | "female" | "other";
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
  marketingOptIn?: boolean;
  source?: "web" | "phone" | "walk-in" | "other";
  status?: "active" | "inactive" | "blocked";
  notes?: string | null;
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> {}
