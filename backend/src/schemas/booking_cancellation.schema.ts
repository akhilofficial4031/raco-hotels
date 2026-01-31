import { z } from "zod";

/**
 * Request schema for requesting a cancellation OTP
 */
export const RequestCancellationOtpSchema = z
  .object({
    bookingReference: z
      .string()
      .min(1, "Booking reference is required")
      .openapi({
        example: "BK-123456-ABCD",
        description: "The booking reference code",
      }),
  })
  .openapi("RequestCancellationOtpRequest");

export type RequestCancellationOtpRequest = z.infer<
  typeof RequestCancellationOtpSchema
>;

/**
 * Response schema for successful OTP request
 */
export const RequestCancellationOtpResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      message: z.string(),
      expiresInMinutes: z.number().int(),
    }),
  })
  .openapi("RequestCancellationOtpResponse");

/**
 * Request schema for verifying OTP and cancelling booking
 */
export const VerifyCancellationOtpSchema = z
  .object({
    bookingReference: z
      .string()
      .min(1, "Booking reference is required")
      .openapi({
        example: "BK-123456-ABCD",
        description: "The booking reference code",
      }),
    otp: z
      .string()
      .length(4, "OTP must be exactly 4 digits")
      .regex(/^\d{4}$/, "OTP must contain only digits")
      .openapi({
        example: "1234",
        description: "The 4-digit OTP code sent to customer email",
      }),
  })
  .openapi("VerifyCancellationOtpRequest");

export type VerifyCancellationOtpRequest = z.infer<
  typeof VerifyCancellationOtpSchema
>;

/**
 * Response schema for successful OTP verification and cancellation
 */
export const VerifyCancellationOtpResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      booking: z.object({
        id: z.number().int(),
        referenceCode: z.string(),
        status: z.string(),
      }),
      message: z.string(),
    }),
  })
  .openapi("VerifyCancellationOtpResponse");

/**
 * Error response schema
 */
export const CancellationErrorResponseSchema = z
  .object({
    success: z.boolean(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.string().optional(),
    }),
  })
  .openapi("CancellationErrorResponse");
