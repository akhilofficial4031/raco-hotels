export interface PaymentDto {
  id: number;
  bookingId: number;
  bookingReferenceCode: string | null;
  amountCents: number;
  currencyCode: string;
  status: string;
  method: string;
  processor: string;
  processorPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentListParamStructure {
  page: number;
  limit: number;
  search: string;
  status: string;
}

export interface PaymentListResponse {
  data: {
    payments: PaymentDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
