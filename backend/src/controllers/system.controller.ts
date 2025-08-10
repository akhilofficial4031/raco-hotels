import { handleAsyncRoute, SystemResponse } from "../lib/responses";

import type { Context } from "hono";

// System controller for health checks and basic endpoints
export class SystemController {
  // GET /health - Health check
  static async healthCheck(c: Context) {
    return handleAsyncRoute(
      c,
      async () => {
        return SystemResponse.healthCheck(c);
      },
      "operation.healthCheckFailed",
    );
  }

  // GET / - API info
  static async getApiInfo(c: Context) {
    return SystemResponse.apiInfo(c);
  }
}
