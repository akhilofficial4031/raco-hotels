import { AvailabilityRepository } from "../repositories/availability.repository";

import type { RoomsAvailabilityQueryParamsSchema } from "../schemas";
import type { z } from "zod";

export class AvailabilityService {
  static async search(
    db: D1Database,
    query: z.infer<typeof RoomsAvailabilityQueryParamsSchema>,
  ) {
    const {
      hotelId,
      checkInDate,
      checkOutDate,
      roomTypeId,
      minPriceCents,
      maxPriceCents,
      amenities,
      guestCount,
      petsAllowed,
    } = query as any;

    if (!checkInDate || !checkOutDate)
      throw new Error("validation: missing dates");
    if (checkInDate >= checkOutDate)
      throw new Error("validation: checkInDate must be before checkOutDate");

    const results = await AvailabilityRepository.findAvailableRoomTypes(
      db,
      checkInDate,
      checkOutDate,
      {
        hotelId: hotelId ? parseInt(hotelId, 10) : undefined,
        roomTypeId: roomTypeId ? parseInt(roomTypeId, 10) : undefined,
        minPriceCents: minPriceCents ? parseInt(minPriceCents, 10) : undefined,
        maxPriceCents: maxPriceCents ? parseInt(maxPriceCents, 10) : undefined,
        amenityCodes: amenities
          ? String(amenities)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        guestCount: guestCount ? parseInt(guestCount, 10) : undefined,
        petsAllowed: petsAllowed ? parseInt(petsAllowed, 10) : undefined,
      },
    );

    return results;
  }
}
