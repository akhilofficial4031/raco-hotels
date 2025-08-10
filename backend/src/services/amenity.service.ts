import { AmenityRepository } from "../repositories/amenity.repository";
import {
  type AmenityQueryParamsSchema,
  type CreateAmenityRequestSchema,
  type UpdateAmenityRequestSchema,
} from "../schemas";

import type { z } from "zod";

export class AmenityService {
  static async createAmenity(
    db: D1Database,
    data: z.infer<typeof CreateAmenityRequestSchema>,
  ) {
    return await AmenityRepository.create(db, {
      ...data,
      icon: data.icon || "",
    });
  }

  static async updateAmenity(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateAmenityRequestSchema>,
  ) {
    const existing = await AmenityRepository.findById(db, id);
    if (!existing) {
      throw new Error("Amenity not found");
    }
    const updated = await AmenityRepository.update(db, id, {
      ...data,
      icon: data.icon || "",
    });
    if (!updated) {
      throw new Error("Amenity not found");
    }
    return updated;
  }

  static async getAmenityById(db: D1Database, id: number) {
    return await AmenityRepository.findById(db, id);
  }

  static async getAmenities(
    db: D1Database,
    query: z.infer<typeof AmenityQueryParamsSchema>,
  ) {
    const { page = 1, limit = 10, search } = query;
    const { amenities, total } = await AmenityRepository.findAll(
      db,
      search || "",
      { page, limit },
    );
    const totalPages = Math.ceil(total / limit);
    return {
      items: amenities,
      pagination: { page, limit, total, totalPages },
    };
  }

  static async deleteAmenity(db: D1Database, id: number) {
    const existing = await AmenityRepository.findById(db, id);
    if (!existing) {
      throw new Error("Amenity not found");
    }
    return await AmenityRepository.delete(db, id);
  }
}
