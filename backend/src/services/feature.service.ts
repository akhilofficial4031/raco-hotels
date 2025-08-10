import { FeatureRepository } from "../repositories/feature.repository";
import {
  type CreateFeatureRequestSchema,
  type UpdateFeatureRequestSchema,
  type FeatureQueryParamsSchema,
} from "../schemas";

import type { z } from "zod";

export class FeatureService {
  static async createFeature(
    db: D1Database,
    data: z.infer<typeof CreateFeatureRequestSchema>,
  ) {
    return await FeatureRepository.create(db, {
      ...data,
      description: data.description || "",
    });
  }

  static async updateFeature(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateFeatureRequestSchema>,
  ) {
    const existing = await FeatureRepository.findById(db, id);
    if (!existing) {
      throw new Error("Feature not found");
    }
    const updated = await FeatureRepository.update(db, id, {
      ...data,
      description: data.description || "",
    });
    if (!updated) {
      throw new Error("Feature not found");
    }
    return updated;
  }

  static async getFeatureById(db: D1Database, id: number) {
    return await FeatureRepository.findById(db, id);
  }

  static async getFeatures(
    db: D1Database,
    query: z.infer<typeof FeatureQueryParamsSchema>,
  ) {
    const { page = 1, limit = 10, search } = query;
    const { features, total } = await FeatureRepository.findAll(
      db,
      search || "",
      { page, limit },
    );
    const totalPages = Math.ceil(total / limit);
    return {
      items: features,
      pagination: { page, limit, total, totalPages },
    };
  }

  static async deleteFeature(db: D1Database, id: number) {
    const existing = await FeatureRepository.findById(db, id);
    if (!existing) {
      throw new Error("Feature not found");
    }
    return await FeatureRepository.delete(db, id);
  }
}
