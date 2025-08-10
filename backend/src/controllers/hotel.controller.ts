import { ApiResponse, HotelResponse, handleAsyncRoute } from "../lib/responses";
import { HotelService } from "../services/hotel.service";

import type { AppContext } from "../types";

export class HotelController {
  static async getHotels(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const isActive = query.isActive
          ? parseInt(query.isActive, 10)
          : undefined;
        const result = await HotelService.getHotels(c.env.DB, {
          page: String(page),
          limit: String(limit),
          city: query.city,
          countryCode: query.countryCode,
          isActive: isActive !== undefined ? String(isActive) : undefined,
          search: query.search,
        } as any);
        return HotelResponse.hotelsList(c, result.items, result.pagination);
      },
      "operation.fetchHotelsFailed",
    );
  }

  static async getHotelById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await HotelService.getHotelById(c.env.DB, id);
        if (!item) return HotelResponse.hotelNotFound(c);
        return HotelResponse.hotelRetrieved(c, item);
      },
      "operation.fetchHotelFailed",
    );
  }

  static async createHotel(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        try {
          const created = await HotelService.createHotel(c.env.DB, payload);
          return HotelResponse.hotelCreated(c, created);
        } catch (e) {
          if (e instanceof Error && e.message.includes("slug")) {
            return ApiResponse.conflict(c, e.message);
          }
          throw e;
        }
      },
      "operation.createHotelFailed",
    );
  }

  static async updateHotel(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();
        try {
          const updated = await HotelService.updateHotel(c.env.DB, id, payload);
          return HotelResponse.hotelUpdated(c, updated);
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === "Hotel not found")
              return HotelResponse.hotelNotFound(c);
            if (e.message.includes("slug")) {
              return ApiResponse.conflict(c, e.message);
            }
          }
          throw e;
        }
      },
      "operation.updateHotelFailed",
    );
  }
  static async deleteHotel(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const deleted = await HotelService.deleteHotel(c.env.DB, id);
          if (!deleted) return HotelResponse.hotelNotFound(c);
          return HotelResponse.hotelDeleted(c);
        } catch (e) {
          if (e instanceof Error && e.message === "Hotel not found") {
            return HotelResponse.hotelNotFound(c);
          }
          throw e;
        }
      },
      "operation.deleteHotelFailed",
    );
  }
}
