import { z } from "zod";

// Inquiry status enum
export const InquiryStatusEnum = z.enum(["pending", "addressed", "confirmed"]);

// Core Inquiry Schema
export const InquirySchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().openapi({ example: "John Doe" }),
    phone: z.string().openapi({ example: "+1234567890" }),
    date: z.string().openapi({ example: "2024-01-15" }),
    message: z.string().openapi({
      example:
        "I would like to inquire about room availability for my vacation.",
    }),
    status: InquiryStatusEnum.openapi({ example: "pending" }),
    remarks: z.string().nullable().openapi({
      example: "Customer called back for clarification",
    }),
    attractionId: z
      .number()
      .int()
      .positive()
      .nullable()
      .optional()
      .openapi({ example: 1 }),
    attractionName: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: "Sunset Beach Resort" }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("Inquiry");

// Create Inquiry Request Schema
export const CreateInquiryRequestSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .openapi({ example: "John Doe" }),
    phone: z
      .string()
      .min(1, "Phone is required")
      .openapi({ example: "+1234567890" }),
    date: z
      .string()
      .min(1, "Date is required")
      .openapi({ example: "2024-01-15" }),
    message: z.string().min(1, "Message is required").openapi({
      example: "I would like to inquire about room availability.",
    }),
    status: InquiryStatusEnum.optional().default("pending"),
    remarks: z.string().optional(),
    attractionSlug: z
      .string()
      .optional()
      .openapi({ example: "sunset-beach-resort" }),
  })
  .openapi("CreateInquiryRequest");

// Update Inquiry Request Schema
export const UpdateInquiryRequestSchema = z
  .object({
    name: z.string().min(1, "Name is required").optional(),
    phone: z.string().min(1, "Phone is required").optional(),
    date: z.string().min(1, "Date is required").optional(),
    message: z.string().min(1, "Message is required").optional(),
    status: InquiryStatusEnum.optional(),
    remarks: z.string().optional().nullable(),
    attractionSlug: z
      .string()
      .optional()
      .openapi({ example: "sunset-beach-resort" }),
  })
  .openapi("UpdateInquiryRequest");

// Inquiry Query Parameters Schema
export const InquiryQueryParamsSchema = z
  .object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    status: z.string().optional(),
    search: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  })
  .openapi("InquiryQueryParams");

// Inquiry List Response Schema
export const InquiryListResponseSchema = z
  .object({
    inquiries: z.array(InquirySchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })
  .openapi("InquiryListResponse");

// Single Inquiry Response Schema
export const InquiryResponseSchema = z
  .object({
    inquiry: InquirySchema,
  })
  .openapi("InquiryResponse");

// Inquiry ID Parameter Schema
export const InquiryIdParamSchema = z
  .object({
    id: z.string().transform(Number).pipe(z.number().int().positive()),
  })
  .openapi("InquiryIdParam");

// Export types
export type InquiryStatus = z.infer<typeof InquiryStatusEnum>;
export type Inquiry = z.infer<typeof InquirySchema>;
export type CreateInquiryRequest = z.infer<typeof CreateInquiryRequestSchema>;
export type UpdateInquiryRequest = z.infer<typeof UpdateInquiryRequestSchema>;
export type InquiryQueryParams = z.infer<typeof InquiryQueryParamsSchema>;
export type InquiryListResponse = z.infer<typeof InquiryListResponseSchema>;
export type InquiryResponse = z.infer<typeof InquiryResponseSchema>;
export type InquiryIdParam = z.infer<typeof InquiryIdParamSchema>;
