import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { CancellationPolicyService } from "../services/cancellation_policy.service";

import type { AppContext } from "../types";

export class CancellationPolicyController {
  static async getPolicies(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const hotelId = query.hotelId ? parseInt(query.hotelId, 10) : undefined;
        const result = await CancellationPolicyService.getPolicies(c.env.DB, {
          page: String(page),
          limit: String(limit),
          hotelId: hotelId !== undefined ? Number(hotelId) : undefined,
        } as any);
        return ApiResponse.success(c, {
          policies: result.items,
          pagination: result.pagination,
        });
      },
      "operation.fetchCancellationPoliciesFailed",
    );
  }

  static async getPolicyById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await CancellationPolicyService.getPolicyById(
          c.env.DB,
          id,
        );
        if (!item)
          return ApiResponse.notFound(c, "Cancellation policy not found");
        return ApiResponse.success(c, { policy: item });
      },
      "operation.fetchCancellationPolicyFailed",
    );
  }

  static async createPolicy(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        const created = await CancellationPolicyService.createPolicy(
          c.env.DB,
          payload,
        );
        return ApiResponse.created(
          c,
          { policy: created },
          "Cancellation policy created",
        );
      },
      "operation.createCancellationPolicyFailed",
    );
  }

  static async updatePolicy(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();
        const updated = await CancellationPolicyService.updatePolicy(
          c.env.DB,
          id,
          payload,
        );
        return ApiResponse.success(
          c,
          { policy: updated },
          "Cancellation policy updated",
        );
      },
      "operation.updateCancellationPolicyFailed",
    );
  }

  static async deletePolicy(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const deleted = await CancellationPolicyService.deletePolicy(
          c.env.DB,
          id,
        );
        if (!deleted)
          return ApiResponse.notFound(c, "Cancellation policy not found");
        return ApiResponse.success(c, {}, "Cancellation policy deleted");
      },
      "operation.deleteCancellationPolicyFailed",
    );
  }
}
