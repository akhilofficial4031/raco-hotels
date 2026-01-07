import { and, desc, eq } from "drizzle-orm";

import {
  contentBlock as contentBlockTable,
  homepageContent as homepageContentTable,
} from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseContentBlock,
  CreateContentBlockData,
  UpdateContentBlockData,
  ContentBlockFilters,
} from "../types";
import type {
  HomepageContentRecord,
  HomePageContent,
  TopBanner,
} from "../types/content.types";

export class ContentRepository {
  static async findAll(
    db: D1Database,
    filters: ContentBlockFilters = {},
  ): Promise<DatabaseContentBlock[]> {
    const database = getDb(db);

    const conditions: any[] = [];
    if (filters.hotelId)
      conditions.push(eq(contentBlockTable.hotelId, filters.hotelId));
    if (filters.page) conditions.push(eq(contentBlockTable.page, filters.page));
    if (filters.section)
      conditions.push(eq(contentBlockTable.section, filters.section));
    if (typeof filters.isVisible === "number")
      conditions.push(eq(contentBlockTable.isVisible, filters.isVisible));

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const rows = await database
      .select()
      .from(contentBlockTable)
      .where(whereClause)
      .orderBy(
        desc(contentBlockTable.sortOrder),
        desc(contentBlockTable.createdAt),
      );
    return rows as any;
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseContentBlock | null> {
    const database = getDb(db);
    const rows = await database
      .select()
      .from(contentBlockTable)
      .where(eq(contentBlockTable.id, id))
      .limit(1);
    return (rows[0] as any) || null;
  }

  static async create(
    db: D1Database,
    data: CreateContentBlockData,
  ): Promise<DatabaseContentBlock> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const [created] = await database
      .insert(contentBlockTable)
      .values({
        ...data,
        title: data.title ?? null,
        body: data.body ?? null,
        mediaUrl: data.mediaUrl ?? null,
        isVisible: data.isVisible ?? 1,
        sortOrder: data.sortOrder ?? 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();
    return created as any;
  }

  static async update(
    db: D1Database,
    id: number,
    data: UpdateContentBlockData,
  ): Promise<DatabaseContentBlock | null> {
    const database = getDb(db);
    const payload = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date().toISOString() }).filter(
        ([, v]) => v !== undefined,
      ),
    );
    const rows = await database
      .update(contentBlockTable)
      .set(payload as any)
      .where(eq(contentBlockTable.id, id))
      .returning();
    return (rows[0] as any) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(contentBlockTable)
      .where(eq(contentBlockTable.id, id))
      .returning();
    return rows.length > 0;
  }

  // Homepage Content Methods
  static async getHomepageContent(
    db: D1Database,
  ): Promise<HomepageContentRecord | null> {
    const database = getDb(db);

    const rows = await database
      .select()
      .from(homepageContentTable)
      .where(eq(homepageContentTable.isPublished, 1))
      .orderBy(desc(homepageContentTable.updatedAt))
      .limit(1);

    return (rows[0] as any) || null;
  }

  static async saveHomepageContent(
    db: D1Database,
    content: HomePageContent,
  ): Promise<HomepageContentRecord> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();
    const contentString = JSON.stringify(content);

    // Check if content exists
    const existing = await this.getHomepageContent(db);

    if (existing) {
      // Update existing
      const [updated] = await database
        .update(homepageContentTable)
        .set({
          content: contentString,
          version: existing.version + 1,
          updatedAt: nowIso,
        } as any)
        .where(eq(homepageContentTable.id, existing.id))
        .returning();
      return updated as any;
    } else {
      // Create new
      const [created] = await database
        .insert(homepageContentTable)
        .values({
          content: contentString,
          version: 1,
          isPublished: 1,
          createdAt: nowIso,
          updatedAt: nowIso,
        } as any)
        .returning();
      return created as any;
    }
  }

  static async deleteHomepageContent(
    db: D1Database,
    id: number,
  ): Promise<boolean> {
    const database = getDb(db);
    const rows = await database
      .delete(homepageContentTable)
      .where(eq(homepageContentTable.id, id))
      .returning();
    return rows.length > 0;
  }

  static async getTopBanner(db: D1Database): Promise<TopBanner | null> {
    const database = getDb(db);

    const rows = await database
      .select()
      .from(homepageContentTable)
      .where(eq(homepageContentTable.isPublished, 1))
      .orderBy(desc(homepageContentTable.updatedAt))
      .limit(1);

    const record = (rows[0] as any) || null;
    if (!record) return null;

    try {
      const content = JSON.parse(record.content);
      return content.topBanner || null;
    } catch (error) {
      console.error("Error parsing homepage content JSON:", error);
      return null;
    }
  }
}
