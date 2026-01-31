export interface PaymentDetails {
  id: number;
  bookingId: number;
  amountCents: number;
  currencyCode: string;
  status: string;
  method: string;
  processor: string;
  processorPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RefundDetails {
  id: number;
  paymentId: number;
  amountCents: number;
  status: string;
  processorRefundId: string | null;
  createdAt: string;
}

export interface RazorpayRefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  notes?: Record<string, string>;
  receipt?: string;
  created_at: number;
}

export interface ProcessRefundRequest {
  paymentId: number;
  amountCents: number;
  notes?: Record<string, string>;
  reason?: string;
}

export interface ProcessRefundResult {
  refund: RefundDetails;
  razorpayRefund: RazorpayRefundResponse;
  success: boolean;
}
