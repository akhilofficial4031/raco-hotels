import { and, desc, eq, like } from "drizzle-orm";

import {
  attraction as attractionTable,
  hotel as hotelTable,
} from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  DatabaseAttraction,
  CreateAttractionData,
  UpdateAttractionData,
  AttractionFilters,
  Attraction,
} from "../types/attraction.interface";

export class AttractionRepository {
  static async findAll(
    db: D1Database,
    filters: AttractionFilters = {},
  ): Promise<Attraction[]> {
    const database = getDb(db);

    const conditions: any[] = [];

    if (filters.hotelId) {
      conditions.push(eq(attractionTable.hotelId, filters.hotelId));
    }

    if (filters.search) {
      conditions.push(like(attractionTable.name, `%${filters.search}%`));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const rows = await database
      .select({
        id: attractionTable.id,
        hotelId: attractionTable.hotelId,
        name: attractionTable.name,
        slug: attractionTable.slug,
        content: attractionTable.content,
        layout: attractionTable.layout,
        createdAt: attractionTable.createdAt,
        updatedAt: attractionTable.updatedAt,
        hotelName: hotelTable.name,
      })
      .from(attractionTable)
      .leftJoin(hotelTable, eq(attractionTable.hotelId, hotelTable.id))
      .where(whereClause)
      .orderBy(desc(attractionTable.createdAt));

    return rows.map((row) => ({
      ...row,
      content: JSON.parse(row.content as string),
    })) as any;
  }

  static async findById(
    db: D1Database,
    id: number,
  ): Promise<Attraction | null> {
    const database = getDb(db);

    const rows = await database
      .select({
        id: attractionTable.id,
        hotelId: attractionTable.hotelId,
        name: attractionTable.name,
        slug: attractionTable.slug,
        content: attractionTable.content,
        layout: attractionTable.layout,
        createdAt: attractionTable.createdAt,
        updatedAt: attractionTable.updatedAt,
        hotelName: hotelTable.name,
      })
      .from(attractionTable)
      .leftJoin(hotelTable, eq(attractionTable.hotelId, hotelTable.id))
      .where(eq(attractionTable.id, id))
      .limit(1);

    if (!rows[0]) return null;

    return {
      ...rows[0],
      content: JSON.parse(rows[0].content as string),
    } as any;
  }

  static async findBySlug(
    db: D1Database,
    slug: string,
  ): Promise<Attraction | null> {
    const database = getDb(db);

    const rows = await database
      .select({
        id: attractionTable.id,
        hotelId: attractionTable.hotelId,
        name: attractionTable.name,
        slug: attractionTable.slug,
        content: attractionTable.content,
        layout: attractionTable.layout,
        createdAt: attractionTable.createdAt,
        updatedAt: attractionTable.updatedAt,
        hotelName: hotelTable.name,
      })
      .from(attractionTable)
      .leftJoin(hotelTable, eq(attractionTable.hotelId, hotelTable.id))
      .where(eq(attractionTable.slug, slug))
      .limit(1);

    if (!rows[0]) return null;

    return {
      ...rows[0],
      content: JSON.parse(rows[0].content as string),
    } as any;
  }

  static async create(
    db: D1Database,
    data: CreateAttractionData,
  ): Promise<DatabaseAttraction> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();

    const [created] = await database
      .insert(attractionTable)
      .values({
        hotelId: data.hotelId,
        name: data.name,
        slug: data.slug,
        content: JSON.stringify(data.content),
        layout: data.layout,
        createdAt: nowIso,
        updatedAt: nowIso,
      } as any)
      .returning();

    return created as any;
  }

  static async update(
    db: D1Database,
    id: number,
    data: UpdateAttractionData,
  ): Promise<DatabaseAttraction | null> {
    const database = getDb(db);

    const payload: any = {
      updatedAt: new Date().toISOString(),
    };

    if (data.hotelId !== undefined) payload.hotelId = data.hotelId;
    if (data.name !== undefined) payload.name = data.name;
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.content !== undefined)
      payload.content = JSON.stringify(data.content);
    if (data.layout !== undefined) payload.layout = data.layout;

    const rows = await database
      .update(attractionTable)
      .set(payload)
      .where(eq(attractionTable.id, id))
      .returning();

    return (rows[0] as any) || null;
  }

  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);

    const rows = await database
      .delete(attractionTable)
      .where(eq(attractionTable.id, id))
      .returning();

    return rows.length > 0;
  }
}
