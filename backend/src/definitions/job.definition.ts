import { z } from "zod";

import { createRoute, ApiTags } from "../lib/route-wrapper";

const DeactivateExpiredPromoCodesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    message: z.string(),
    deactivatedCount: z.number(),
  }),
});

export const JobRouteDefinitions = {
  deactivateExpiredPromoCodes: createRoute({
    method: "post",
    path: "/jobs/deactivate-expired-promo-codes",
    summary: "Deactivate expired promo codes",
    description:
      "Deactivates promo codes whose end date has passed. Intended to be called by a cron job.",
    tags: [ApiTags.SYSTEM],
    successSchema: DeactivateExpiredPromoCodesResponseSchema,
    successDescription: "Promo codes deactivated successfully",
    includeUnauthorized: true,
  }),
};
