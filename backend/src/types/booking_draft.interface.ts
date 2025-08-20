import type { HotelScopedEntity, MonetaryAmount } from "./common.interface";

/**
 * Database representation of a booking draft
 */
export interface DatabaseBookingDraft extends HotelScopedEntity {
  sessionId: string;
  referenceCode: string;
  roomTypeId: number;
  ratePlanId: number | null;
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  petsCount: number;
  currencyCode: string;
  promoCode: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  addOnsJson: string | null;
  amounts: MonetaryAmount;
  expiresAt: string;
}

/**
 * Data required to create a new booking draft
 */
export interface CreateBookingDraftData {
  sessionId: string;
  referenceCode: string;
  hotelId: number;
  roomTypeId: number;
  ratePlanId?: number | null;
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  petsCount?: number;
  currencyCode: string;
  promoCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  addOnsJson?: string;
  amounts: MonetaryAmount;
  expiresAt?: string;
}

/**
 * Data that can be updated for a booking draft
 */
export interface UpdateBookingDraftData
  extends Partial<
    Omit<CreateBookingDraftData, "sessionId" | "referenceCode" | "hotelId">
  > {}
