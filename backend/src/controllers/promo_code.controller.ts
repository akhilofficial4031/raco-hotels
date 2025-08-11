import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { PromoCodeService } from "../services/promo_code.service";

import type { AppContext } from "../types";

export class PromoCodeController {
  static async getPromoCodes(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const result = await PromoCodeService.getPromoCodes(c.env.DB, {
          page: String(page),
          limit: String(limit),
          hotelId: query.hotelId,
          isActive: query.isActive,
          code: query.code,
        } as any);
        return ApiResponse.success(c, {
          promoCodes: result.items,
          pagination: result.pagination,
        });
      },
      "operation.fetchPromoCodesFailed",
    );
  }

  static async getPromoCodeById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await PromoCodeService.getPromoCodeById(c.env.DB, id);
        if (!item) return ApiResponse.notFound(c, "Promo code not found");
        return ApiResponse.success(c, { promoCode: item });
      },
      "operation.fetchPromoCodeFailed",
    );
  }

  static async createPromoCode(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        const created = await PromoCodeService.createPromoCode(
          c.env.DB,
          payload,
        );
        return ApiResponse.created(c, { promoCode: created });
      },
      "operation.createPromoCodeFailed",
    );
  }

  static async updatePromoCode(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();
        try {
          const updated = await PromoCodeService.updatePromoCode(
            c.env.DB,
            id,
            payload,
          );
          return ApiResponse.success(c, { promoCode: updated });
        } catch (e) {
          if (e instanceof Error && e.message === "Promo code not found")
            return ApiResponse.notFound(c, e.message);
          throw e;
        }
      },
      "operation.updatePromoCodeFailed",
    );
  }

  static async deletePromoCode(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const deleted = await PromoCodeService.deletePromoCode(c.env.DB, id);
          if (!deleted) return ApiResponse.notFound(c, "Promo code not found");
          return ApiResponse.success(c, {});
        } catch (e) {
          if (e instanceof Error && e.message === "Promo code not found")
            return ApiResponse.notFound(c, e.message);
          throw e;
        }
      },
      "operation.deletePromoCodeFailed",
    );
  }
}
