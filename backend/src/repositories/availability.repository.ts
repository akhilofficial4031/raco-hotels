import { and, between, count, eq, inArray, sql, sum } from "drizzle-orm";

import {
  roomInventory,
  roomRate,
  roomType as roomTypeTable,
  roomTypeAmenity,
  roomTypeImage,
  amenity as amenityTable,
} from "../../drizzle/schema";
import { getDb } from "../db";

export interface AvailabilityFilters {
  hotelId?: number;
  roomTypeId?: number;
  minPriceCents?: number;
  maxPriceCents?: number;
  amenityCodes?: string[];
  guestCount?: number;
  petsAllowed?: number; // reserved for future use
}

export class AvailabilityRepository {
  static async findAvailableRoomTypes(
    db: D1Database,
    startDate: string,
    endDate: string,
    filters: AvailabilityFilters = {},
  ) {
    const database = getDb(db);

    // 1) Candidate room types by hotel, capacity, and amenity filters
    const rtConditions: any[] = [];
    if (filters.hotelId)
      rtConditions.push(eq(roomTypeTable.hotelId, filters.hotelId));
    if (filters.guestCount)
      rtConditions.push(
        sql`${roomTypeTable.maxOccupancy} >= ${filters.guestCount}`,
      );

    const candidateRoomTypes = (await database
      .select()
      .from(roomTypeTable)
      .where(rtConditions.length ? and(...rtConditions) : undefined)) as any[];

    if (filters.amenityCodes && filters.amenityCodes.length > 0) {
      // Filter by amenities: require all specified codes
      const codes = filters.amenityCodes;
      const withAmenity = await database
        .select({
          roomTypeId: roomTypeAmenity.roomTypeId,
          code: amenityTable.code,
        })
        .from(roomTypeAmenity)
        .leftJoin(amenityTable, eq(roomTypeAmenity.amenityId, amenityTable.id))
        .where(inArray(amenityTable.code, codes));
      const map = new Map<number, Set<string>>();
      for (const row of withAmenity) {
        const set = map.get(row.roomTypeId) ?? new Set<string>();
        if (row.code) set.add(row.code);
        map.set(row.roomTypeId, set);
      }
      const required = new Set(codes);
      candidateRoomTypes.splice(
        0,
        candidateRoomTypes.length,
        ...candidateRoomTypes.filter((rt) => {
          const got = map.get(rt.id) ?? new Set<string>();
          for (const code of required) if (!got.has(code)) return false;
          return true;
        }),
      );
    }

    if (candidateRoomTypes.length === 0) return [] as any[];

    const roomTypeIds = candidateRoomTypes.map((r) => r.id);

    // 2) Availability across the range: require availableRooms + overbookLimit > 0 each night
    const invRows = await database
      .select()
      .from(roomInventory)
      .where(
        and(
          inArray(roomInventory.roomTypeId, roomTypeIds),
          between(roomInventory.date, startDate, endDate),
          eq(roomInventory.closed, 0),
        ),
      );

    // Aggregate min availability per room type across dates
    const nights = await database
      .select({ n: count() })
      .from(roomRate)
      .where(
        and(
          inArray(roomRate.roomTypeId, roomTypeIds),
          between(roomRate.date, startDate, endDate),
        ),
      );
    const totalNights = nights[0]?.n ?? 0;

    const byRoomType: Record<number, { availableCount: number; days: number }> =
      {};
    for (const r of invRows as any[]) {
      const k = r.roomTypeId as number;
      const available = (r.availableRooms ?? 0) + (r.overbookLimit ?? 0);
      const entry = byRoomType[k] || {
        availableCount: Number.MAX_SAFE_INTEGER,
        days: 0,
      };
      entry.availableCount = Math.min(entry.availableCount, available);
      entry.days += 1;
      byRoomType[k] = entry;
    }

    // 3) Pricing per night for candidates
    const priceConditions: any[] = [inArray(roomRate.roomTypeId, roomTypeIds)];
    priceConditions.push(between(roomRate.date, startDate, endDate));
    if (filters.minPriceCents)
      priceConditions.push(
        sql`${roomRate.priceCents} >= ${filters.minPriceCents}`,
      );
    if (filters.maxPriceCents)
      priceConditions.push(
        sql`${roomRate.priceCents} <= ${filters.maxPriceCents}`,
      );

    const rateRows = (await database
      .select({
        roomTypeId: roomRate.roomTypeId,
        priceCents: roomRate.priceCents,
        date: roomRate.date,
      })
      .from(roomRate)
      .where(and(...priceConditions))) as any[];

    const ratesByRt = new Map<number, number[]>();
    for (const row of rateRows) {
      const arr = ratesByRt.get(row.roomTypeId) ?? [];
      arr.push(row.priceCents);
      ratesByRt.set(row.roomTypeId, arr);
    }

    // 4) Images
    const images = (await database
      .select()
      .from(roomTypeImage)
      .where(inArray(roomTypeImage.roomTypeId, roomTypeIds))) as any[];
    const imagesByRt = new Map<number, any[]>();
    for (const img of images) {
      const arr = imagesByRt.get(img.roomTypeId) ?? [];
      arr.push({ id: img.id, url: img.url, alt: img.alt });
      imagesByRt.set(img.roomTypeId, arr);
    }

    // 5) Build result, only include room types with full coverage across dates
    const results: any[] = [];
    for (const rt of candidateRoomTypes) {
      const avail = byRoomType[rt.id];
      const nightly = ratesByRt.get(rt.id) ?? [];
      if (!avail || avail.days < totalNights || nightly.length < totalNights)
        continue;
      results.push({
        roomTypeId: rt.id,
        hotelId: rt.hotelId,
        name: rt.name,
        maxOccupancy: rt.maxOccupancy,
        basePriceCents: rt.basePriceCents,
        currencyCode: rt.currencyCode,
        availableCount: avail.availableCount,
        nightlyPricesCents: nightly,
        images: imagesByRt.get(rt.id) ?? [],
      });
    }

    return results;
  }
}
