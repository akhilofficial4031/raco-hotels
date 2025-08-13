import { ContentRepository } from "../repositories/content.repository";

import type {
  CreateContentBlockRequestSchema,
  UpdateContentBlockRequestSchema,
  ContentBlockQueryParamsSchema,
} from "../schemas";
import type { z } from "zod";

export class ContentService {
  static async createContentBlock(
    db: D1Database,
    data: z.infer<typeof CreateContentBlockRequestSchema>,
  ) {
    return await ContentRepository.create(db, data);
  }

  static async updateContentBlock(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateContentBlockRequestSchema>,
  ) {
    const existing = await ContentRepository.findById(db, id);
    if (!existing) throw new Error("Content block not found");
    const updated = await ContentRepository.update(db, id, data);
    if (!updated) throw new Error("Content block not found");
    return updated;
  }

  static async getContentBlockById(db: D1Database, id: number) {
    return await ContentRepository.findById(db, id);
  }

  static async getContentBlocks(
    db: D1Database,
    query: z.infer<typeof ContentBlockQueryParamsSchema>,
  ) {
    const { hotelId, page, section, isVisible } = query as any;
    const items = await ContentRepository.findAll(db, {
      hotelId: hotelId ? parseInt(hotelId as any, 10) : undefined,
      page,
      section,
      isVisible: typeof isVisible === "number" ? isVisible : undefined,
    });
    return { items };
  }

  static async deleteContentBlock(db: D1Database, id: number) {
    const existing = await ContentRepository.findById(db, id);
    if (!existing) throw new Error("Content block not found");
    return await ContentRepository.delete(db, id);
  }
}
