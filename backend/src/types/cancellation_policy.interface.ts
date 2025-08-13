export interface DatabaseCancellationPolicy {
  id: number;
  hotelId: number;
  name: string;
  description: string | null;
  freeCancelUntilHours: number | null;
  penaltyType: string | null; // e.g., "percentage" | "fixed"
  penaltyValue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCancellationPolicyData
  extends Partial<DatabaseCancellationPolicy> {
  hotelId: number;
  name: string;
}

export interface UpdateCancellationPolicyData
  extends Partial<DatabaseCancellationPolicy> {
  name?: string;
}
