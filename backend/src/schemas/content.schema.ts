import { z } from "zod";

export const ContentBlockSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    hotelId: z.number().int().nullable().openapi({ example: 1 }),
    page: z.string().openapi({ example: "home" }),
    section: z.string().openapi({ example: "hero" }),
    title: z.string().nullable().openapi({ example: "Welcome" }),
    body: z.string().nullable().openapi({ example: "Markdown or HTML" }),
    mediaUrl: z.string().nullable().openapi({ example: "https://cdn/img.jpg" }),
    sortOrder: z.number().int().openapi({ example: 0 }),
    isVisible: z.number().int().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("ContentBlock");

export const CreateContentBlockRequestSchema = z
  .object({
    hotelId: z.number().int().optional().openapi({ example: 1 }),
    page: z.string().min(1).openapi({ example: "home" }),
    section: z.string().min(1).openapi({ example: "hero" }),
    title: z.string().optional().openapi({ example: "Welcome" }),
    body: z.string().optional().openapi({ example: "Markdown or HTML" }),
    mediaUrl: z.string().optional().openapi({ example: "https://cdn/img.jpg" }),
    sortOrder: z.number().int().optional().openapi({ example: 0 }),
    isVisible: z.number().int().optional().openapi({ example: 1 }),
  })
  .openapi("CreateContentBlockRequest");

export const UpdateContentBlockRequestSchema =
  CreateContentBlockRequestSchema.partial().openapi(
    "UpdateContentBlockRequest",
  );

export const ContentBlockPathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((v) => parseInt(v, 10))
      .openapi({ example: "1", description: "Content block ID" }),
  })
  .openapi("ContentBlockPathParams");

export const ContentBlockQueryParamsSchema = z
  .object({
    page: z.string().optional().openapi({ example: "home" }),
    section: z.string().optional().openapi({ example: "hero" }),
    hotelId: z.string().optional().openapi({ example: "1" }),
    isVisible: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : undefined))
      .openapi({ example: "1" }),
  })
  .openapi("ContentBlockQueryParams");

export const ContentBlockResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      contentBlock: ContentBlockSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("ContentBlockResponse");

export const ContentBlocksListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      contentBlocks: z.array(ContentBlockSchema),
      message: z.string().optional(),
    }),
  })
  .openapi("ContentBlocksListResponse");
