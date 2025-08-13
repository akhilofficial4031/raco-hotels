import z from "zod";

/**
 * LocationInfoSectionSchema
 *
 * Used to model rich location information for a hotel, such as nearby
 * attractions, descriptions, and optional images. This enhances the hotel
 * detail pages and supports the booking decision process by giving guests
 * helpful context about the area.
 */
const LocationInfoImageSchema = z
  .object({
    url: z.string().url().openapi({ example: "https://cdn.example.com/img.jpg" }),
    alt: z.string().nullable().optional().openapi({ example: "Golden Gate Bridge" }),
  })
  .openapi("LocationInfoImage");

export const LocationInfoSectionSchema = z
  .object({
    heading: z.string().openapi({ example: "Nearby Attractions" }),
    subHeading: z.string().nullable().optional().openapi({ example: "Top picks" }),
    bulletPoints: z
      .array(z.string())
      .nullable()
      .optional()
      .openapi({ example: ["5 min to beach", "Close to metro"] }),
    description: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: "Great neighborhood with lots to do." }),
    images: z.array(LocationInfoImageSchema).nullable().optional(),
  })
  .openapi("LocationInfoSection");


