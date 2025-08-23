import { AddonRepository } from "../repositories/addon.repository";
import {
  type AddonQueryParamsSchema,
  type CreateAddonRequestSchema,
  type UpdateAddonRequestSchema,
} from "../schemas";

import type { z } from "zod";

export class AddonService {
  static async createAddon(
    db: D1Database,
    data: z.infer<typeof CreateAddonRequestSchema>,
  ) {
    return await AddonRepository.create(db, {
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      unitType: data.unitType || "item",
      isActive: data.isActive ?? 1,
      sortOrder: data.sortOrder ?? 0,
    });
  }

  static async updateAddon(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateAddonRequestSchema>,
  ) {
    const existing = await AddonRepository.findById(db, id);
    if (!existing) {
      throw new Error("Addon not found");
    }

    const updateData: any = {};

    // Only include fields that are provided
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unitType !== undefined) updateData.unitType = data.unitType;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const updated = await AddonRepository.update(db, id, updateData);
    if (!updated) {
      throw new Error("Addon not found");
    }
    return updated;
  }

  static async getAddonById(db: D1Database, id: number) {
    return await AddonRepository.findById(db, id);
  }

  static async getAddons(
    db: D1Database,
    query: z.infer<typeof AddonQueryParamsSchema>,
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive,
      unitType,
    } = query;

    const filters = {
      ...(category && { category }),
      ...(isActive !== undefined && { isActive }),
      ...(unitType && { unitType }),
    };

    const { addons, total } = await AddonRepository.findAll(
      db,
      search || "",
      filters,
      { page, limit },
    );

    const totalPages = Math.ceil(total / limit);
    return {
      items: addons,
      pagination: { page, limit, total, totalPages },
    };
  }

  static async deleteAddon(db: D1Database, id: number) {
    const existing = await AddonRepository.findById(db, id);
    if (!existing) {
      throw new Error("Addon not found");
    }
    return await AddonRepository.delete(db, id);
  }

  static async getAddonsByCategory(db: D1Database, category: string) {
    return await AddonRepository.findByCategory(db, category);
  }

  static async getActiveAddons(db: D1Database) {
    return await AddonRepository.findActiveAddons(db);
  }

  static async toggleAddonStatus(db: D1Database, id: number) {
    const existing = await AddonRepository.findById(db, id);
    if (!existing) {
      throw new Error("Addon not found");
    }

    const newStatus = existing.isActive === 1 ? 0 : 1;
    const updated = await AddonRepository.update(db, id, {
      isActive: newStatus,
    });

    if (!updated) {
      throw new Error("Addon not found");
    }
    return updated;
  }

  /**
   * Validate addon business rules
   */
  static validateAddonData(data: z.infer<typeof CreateAddonRequestSchema>) {
    // Validate unit type
    const validUnitTypes = ["item", "person", "night", "hour"];
    if (!validUnitTypes.includes(data.unitType)) {
      throw new Error(
        `Invalid unit type. Must be one of: ${validUnitTypes.join(", ")}`,
      );
    }

    // Validate sort order
    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      throw new Error("Sort order must be a non-negative number");
    }

    // Validate isActive
    if (data.isActive !== undefined && ![0, 1].includes(data.isActive)) {
      throw new Error("isActive must be 0 or 1");
    }
  }
}
