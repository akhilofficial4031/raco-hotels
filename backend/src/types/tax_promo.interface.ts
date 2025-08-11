export interface DatabaseTaxFee {
  id: number;
  hotelId: number;
  name: string;
  type: "percent" | "fixed";
  value: number; // percent (0..100) or amount in cents
  scope: string; // per_stay | per_night | per_person
  includedInPrice: number; // 0/1
  isActive: number; // 0/1
  createdAt: string;
  updatedAt: string;
}

export interface DatabasePromoCode {
  id: number;
  hotelId: number;
  code: string;
  type: "percent" | "fixed";
  value: number; // percent (0..100) or amount in cents
  startDate: string | null;
  endDate: string | null;
  minNights: number | null;
  minAmountCents: number | null;
  maxDiscountCents: number | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}
