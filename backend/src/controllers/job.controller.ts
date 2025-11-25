import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { PromoCodeService } from "../services/promo_code.service";

import type { AppContext } from "../types";

export class JobController {
  static async deactivateExpiredPromoCodes(c: AppContext) {
    const cronHeader = c.req.header("CF-Cron-Secret");

    const isDev = c.env.ENVIRONMENT === "development";

    if (!isDev && (!cronHeader || cronHeader !== c.env.CRON_SECRET)) {
      return ApiResponse.unauthorized(c, "system.cronUnauthorized");
    }

    return handleAsyncRoute(
      c,
      async () => {
        const count = await PromoCodeService.deactivateExpiredPromoCodes(
          c.env.DB,
        );
        return ApiResponse.success(c, {
          message: `Deactivated ${count} expired promo codes.`,
          deactivatedCount: count,
        });
      },
      "operation.deactivateExpiredPromoCodesFailed",
    );
  }
}
