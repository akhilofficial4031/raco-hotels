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
    // Check if slug already exists
    const existingAddon = await AddonRepository.findBySlug(db, data.slug);
    if (existingAddon) {
      throw new Error("Addon with this slug already exists");
    }

    return await AddonRepository.create(db, {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      category: data.category || null,
      unitType: data.unitType || "item",
      isActive: data.isActive ?? 1,
      sortOrder: data.sortOrder ?? 0,
      imageUrl: data.imageUrl || null,
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

    // Check if slug is being updated and if it conflicts with existing addon
    if (data.slug && data.slug !== existing.slug) {
      const existingWithSlug = await AddonRepository.findBySlug(db, data.slug);
      if (existingWithSlug && existingWithSlug.id !== id) {
        throw new Error("Addon with this slug already exists");
      }
    }

    const updateData: any = {};

    // Only include fields that are provided
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unitType !== undefined) updateData.unitType = data.unitType;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

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
   * Generate a slug from addon name
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim();
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
