import { z } from "zod";

const ButtonContentSchema = z.object({
  text: z.string(),
  type: z.enum(["primary", "secondary"]),
  action: z.string(),
});

const ReviewItemSchema = z.object({
  name: z.string(),
  review: z.string(),
  stars: z.number().min(1).max(5),
});

export const AttractionContentSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
    imageUrl: z.string(),
  }),
  marqueeTexts: z.array(z.string()),
  aboutSection: z.object({
    title: z.string(),
    description: z.string(),
    subtext: z.array(z.string()),
    buttons: z.array(ButtonContentSchema),
    images: z.array(z.string()),
  }),
  carouselSection: z.object({
    tag: z.string(),
    title: z.string(),
    subtitle: z.string(),
    images: z.array(z.string()),
  }),
  feature: z.object({
    tag: z.string(),
    title: z.string(),
    subtitle: z.string(),
    images: z.array(z.string()),
    button: ButtonContentSchema,
  }),
  reviews: z.object({
    tag: z.string(),
    title: z.string(),
    items: z.array(ReviewItemSchema),
  }),
  gallery: z.object({
    tag: z.string(),
    title: z.string(),
    images: z.array(z.string()),
  }),
});

export const AttractionSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Historic Downtown" }),
    slug: z.string().openapi({ example: "historic-downtown" }),
    content: z.any().openapi({ example: {} }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    hotelName: z.string().optional().openapi({ example: "Grand Hotel" }),
  })
  .openapi("Attraction");

export const CreateAttractionRequestSchema = z
  .object({
    hotelId: z.number().int().positive().openapi({ example: 1 }),
    name: z.string().min(1).openapi({ example: "Historic Downtown" }),
    slug: z.string().min(1).openapi({ example: "historic-downtown" }),
    content: AttractionContentSchema,
  })
  .openapi("CreateAttractionRequest");

export const UpdateAttractionRequestSchema =
  CreateAttractionRequestSchema.partial().openapi("UpdateAttractionRequest");

export const AttractionPathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((v) => parseInt(v, 10))
      .openapi({ example: "1", description: "Attraction ID" }),
  })
  .openapi("AttractionPathParams");

export const AttractionSlugParamsSchema = z
  .object({
    slug: z.string().openapi({
      example: "historic-downtown",
      description: "Attraction slug",
    }),
  })
  .openapi("AttractionSlugParams");

export const AttractionQueryParamsSchema = z
  .object({
    page: z.string().optional().openapi({ example: "1" }),
    limit: z.string().optional().openapi({ example: "10" }),
    search: z.string().optional().openapi({ example: "downtown" }),
    hotelId: z.string().optional().openapi({ example: "1" }),
  })
  .openapi("AttractionQueryParams");

export const AttractionResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      attraction: AttractionSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("AttractionResponse");

export const AttractionsListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      attractions: z.array(AttractionSchema),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
      }),
      message: z.string().optional(),
    }),
  })
  .openapi("AttractionsListResponse");
