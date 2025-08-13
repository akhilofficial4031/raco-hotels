import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { TaxFeeService } from "../services/tax_fee.service";

import type { AppContext } from "../types";

export class TaxFeeController {
  static async getTaxFees(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const result = await TaxFeeService.getTaxFees(c.env.DB, {
          page: String(page),
          limit: String(limit),
          hotelId: query.hotelId,
          isActive: query.isActive,
          name: query.name,
        } as any);
        return ApiResponse.success(c, {
          taxFees: result.items,
          pagination: result.pagination,
        });
      },
      "operation.fetchTaxFeesFailed",
    );
  }

  static async getTaxFeeById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await TaxFeeService.getTaxFeeById(c.env.DB, id);
        if (!item) return ApiResponse.notFound(c, "Tax fee not found");
        return ApiResponse.success(c, { taxFee: item });
      },
      "operation.fetchTaxFeeFailed",
    );
  }

  static async createTaxFee(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        const created = await TaxFeeService.createTaxFee(c.env.DB, payload);
        return ApiResponse.created(c, { taxFee: created });
      },
      "operation.createTaxFeeFailed",
    );
  }

  static async updateTaxFee(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();
        try {
          const updated = await TaxFeeService.updateTaxFee(
            c.env.DB,
            id,
            payload,
          );
          return ApiResponse.success(c, { taxFee: updated });
        } catch (e) {
          if (e instanceof Error && e.message === "Tax fee not found")
            return ApiResponse.notFound(c, e.message);
          throw e;
        }
      },
      "operation.updateTaxFeeFailed",
    );
  }

  static async deleteTaxFee(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const deleted = await TaxFeeService.deleteTaxFee(c.env.DB, id);
          if (!deleted) return ApiResponse.notFound(c, "Tax fee not found");
          return ApiResponse.success(c, {});
        } catch (e) {
          if (e instanceof Error && e.message === "Tax fee not found")
            return ApiResponse.notFound(c, e.message);
          throw e;
        }
      },
      "operation.deleteTaxFeeFailed",
    );
  }
}
