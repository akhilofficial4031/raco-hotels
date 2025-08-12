import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { AvailabilityService } from "../services/availability.service";

import type { AppContext } from "../types";

export class AvailabilityController {
  static async getAvailability(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const results = await AvailabilityService.search(
          c.env.DB,
          query as any,
        );
        return ApiResponse.success(c, { results });
      },
      "operation.fetchAvailabilityFailed",
    );
  }
}
