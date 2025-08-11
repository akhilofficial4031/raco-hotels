import { PromoCodeRepository } from "../repositories/promo_code.repository";

import type {
  CreatePromoCodeRequestSchema,
  UpdatePromoCodeRequestSchema,
  PromoCodeQueryParamsSchema,
} from "../schemas";
import type { z } from "zod";

export class PromoCodeService {
  static async createPromoCode(
    db: D1Database,
    data: z.infer<typeof CreatePromoCodeRequestSchema>,
  ) {
    return await PromoCodeRepository.create(db, data);
  }

  static async updatePromoCode(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdatePromoCodeRequestSchema>,
  ) {
    const existing = await PromoCodeRepository.findById(db, id);
    if (!existing) throw new Error("Promo code not found");
    const updated = await PromoCodeRepository.update(db, id, data);
    if (!updated) throw new Error("Promo code not found");
    return updated;
  }

  static async getPromoCodeById(db: D1Database, id: number) {
    return await PromoCodeRepository.findById(db, id);
  }

  static async getPromoCodes(
    db: D1Database,
    query: z.infer<typeof PromoCodeQueryParamsSchema>,
  ) {
    const { page = 1, limit = 10, hotelId, isActive, code } = query as any;
    const { items, total } = await PromoCodeRepository.findAll(
      db,
      {
        hotelId: hotelId ? parseInt(hotelId as any, 10) : undefined,
        isActive: typeof isActive === "number" ? isActive : undefined,
        code,
      },
      { page, limit },
    );
    const totalPages = Math.ceil(total / limit);
    return { items, pagination: { page, limit, total, totalPages } };
  }

  static async deletePromoCode(db: D1Database, id: number) {
    const existing = await PromoCodeRepository.findById(db, id);
    if (!existing) throw new Error("Promo code not found");
    return await PromoCodeRepository.delete(db, id);
  }
}
