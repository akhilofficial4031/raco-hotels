import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { RoomTypeService } from "../services/room_type.service";

import type { AppContext } from "../types";

export class RoomTypeController {
  static async getRoomTypes(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const isActive = query.isActive
          ? parseInt(query.isActive, 10)
          : undefined;
        const result = await RoomTypeService.getRoomTypes(c.env.DB, {
          page: String(page),
          limit: String(limit),
          hotelId: query.hotelId,
          isActive: isActive !== undefined ? String(isActive) : undefined,
          search: query.search,
        } as any);
        return ApiResponse.success(c, {
          roomTypes: result.items,
          pagination: result.pagination,
        });
      },
      "operation.fetchRoomTypesFailed",
    );
  }

  static async getRoomTypeById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await RoomTypeService.getRoomTypeById(c.env.DB, id);
        if (!item) return ApiResponse.notFound(c, "Room type not found");
        return ApiResponse.success(c, { roomType: item });
      },
      "operation.fetchRoomTypeFailed",
    );
  }

  static async createRoomType(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        try {
          const created = await RoomTypeService.createRoomType(
            c.env.DB,
            payload,
          );
          return ApiResponse.created(c, { roomType: created });
        } catch (e) {
          if (e instanceof Error && e.message.includes("slug")) {
            return ApiResponse.conflict(c, e.message);
          }
          throw e;
        }
      },
      "operation.createRoomTypeFailed",
    );
  }

  static async updateRoomType(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();
        try {
          const updated = await RoomTypeService.updateRoomType(
            c.env.DB,
            id,
            payload,
          );
          return ApiResponse.success(c, { roomType: updated });
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === "Room type not found")
              return ApiResponse.notFound(c, "Room type not found");
            if (e.message.includes("slug"))
              return ApiResponse.conflict(c, e.message);
          }
          throw e;
        }
      },
      "operation.updateRoomTypeFailed",
    );
  }

  static async deleteRoomType(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const deleted = await RoomTypeService.deleteRoomType(c.env.DB, id);
          if (!deleted) return ApiResponse.notFound(c, "Room type not found");
          return ApiResponse.success(c, {});
        } catch (e) {
          if (e instanceof Error && e.message === "Room type not found") {
            return ApiResponse.notFound(c, "Room type not found");
          }
          throw e;
        }
      },
      "operation.deleteRoomTypeFailed",
    );
  }
}
