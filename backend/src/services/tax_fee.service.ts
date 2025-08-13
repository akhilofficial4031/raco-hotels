import { TaxFeeRepository } from "../repositories/tax_fee.repository";

import type {
  CreateTaxFeeRequestSchema,
  UpdateTaxFeeRequestSchema,
  TaxFeeQueryParamsSchema,
} from "../schemas";
import type { z } from "zod";

export class TaxFeeService {
  static async createTaxFee(
    db: D1Database,
    data: z.infer<typeof CreateTaxFeeRequestSchema>,
  ) {
    return await TaxFeeRepository.create(db, data);
  }

  static async updateTaxFee(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateTaxFeeRequestSchema>,
  ) {
    const existing = await TaxFeeRepository.findById(db, id);
    if (!existing) throw new Error("Tax fee not found");
    const updated = await TaxFeeRepository.update(db, id, data);
    if (!updated) throw new Error("Tax fee not found");
    return updated;
  }

  static async getTaxFeeById(db: D1Database, id: number) {
    return await TaxFeeRepository.findById(db, id);
  }

  static async getTaxFees(
    db: D1Database,
    query: z.infer<typeof TaxFeeQueryParamsSchema>,
  ) {
    const { page = 1, limit = 10, hotelId, isActive, name } = query as any;
    const { items, total } = await TaxFeeRepository.findAll(
      db,
      {
        hotelId: hotelId ? parseInt(hotelId as any, 10) : undefined,
        isActive: typeof isActive === "number" ? isActive : undefined,
        name,
      },
      { page, limit },
    );
    const totalPages = Math.ceil(total / limit);
    return { items, pagination: { page, limit, total, totalPages } };
  }

  static async deleteTaxFee(db: D1Database, id: number) {
    const existing = await TaxFeeRepository.findById(db, id);
    if (!existing) throw new Error("Tax fee not found");
    return await TaxFeeRepository.delete(db, id);
  }
}
