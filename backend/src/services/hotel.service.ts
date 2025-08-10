import { HotelRepository } from "../repositories/hotel.repository";

import type {
  CreateHotelRequestSchema,
  UpdateHotelRequestSchema,
  HotelQueryParamsSchema,
} from "../schemas";
import type { z } from "zod";

export class HotelService {
  static async createHotel(
    db: D1Database,
    data: z.infer<typeof CreateHotelRequestSchema>,
  ) {
    // If slug provided, ensure uniqueness
    if (data.slug) {
      const existing = await HotelRepository.findBySlug(db, data.slug);
      if (existing) {
        throw new Error("Hotel slug already in use");
      }
    }

    return await HotelRepository.create(db, {
      ...data,
      isActive: data.isActive ?? 1,
    });
  }

  static async updateHotel(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateHotelRequestSchema>,
  ) {
    const existing = await HotelRepository.findById(db, id);
    if (!existing) {
      throw new Error("Hotel not found");
    }
    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await HotelRepository.findBySlug(db, data.slug);
      if (slugTaken) {
        throw new Error("Hotel slug already in use");
      }
    }
    const updated = await HotelRepository.update(db, id, data);
    if (!updated) {
      throw new Error("Hotel not found");
    }
    return updated;
  }

  static async getHotelById(db: D1Database, id: number) {
    return await HotelRepository.findById(db, id);
  }

  static async getHotels(
    db: D1Database,
    query: z.infer<typeof HotelQueryParamsSchema>,
  ) {
    const { page = 1, limit = 10, city, countryCode, isActive, search } = query;
    const { hotels, total } = await HotelRepository.findAll(
      db,
      { city, countryCode, isActive, search },
      { page, limit },
    );
    const totalPages = Math.ceil(total / limit);
    return {
      items: hotels,
      pagination: { page, limit, total, totalPages },
    };
  }

  static async deleteHotel(db: D1Database, id: number) {
    const existing = await HotelRepository.findById(db, id);
    if (!existing) {
      throw new Error("Hotel not found");
    }
    return await HotelRepository.delete(db, id);
  }
}
