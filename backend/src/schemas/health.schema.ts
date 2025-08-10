import { z } from "zod";

// Health Check Schema
export const HealthCheckResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    data: z.object({
      status: z.string().openapi({ example: "healthy" }),
      timestamp: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
      service: z.string().openapi({ example: "raco-hotels-backend" }),
    }),
  })
  .openapi("HealthCheckResponse");
