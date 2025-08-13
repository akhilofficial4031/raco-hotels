import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { RoomService } from "../services/room.service";

import type { AppContext } from "../types";

export class RoomController {
  static async getRooms(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const isActive = query.isActive
          ? parseInt(query.isActive, 10)
          : undefined;
        const result = await RoomService.getRooms(c.env.DB, {
          page: String(page),
          limit: String(limit),
          hotelId: query.hotelId,
          roomTypeId: query.roomTypeId,
          status: query.status,
          isActive: isActive !== undefined ? String(isActive) : undefined,
          search: query.search,
        } as any);
        return ApiResponse.success(c, {
          rooms: result.items,
          pagination: result.pagination,
        });
      },
      "operation.fetchRoomsFailed",
    );
  }

  static async getRoomById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await RoomService.getRoomById(c.env.DB, id);
        if (!item) return ApiResponse.notFound(c, "Room not found");
        return ApiResponse.success(c, { room: item });
      },
      "operation.fetchRoomFailed",
    );
  }

  static async createRoom(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        try {
          const created = await RoomService.createRoom(c.env.DB, payload);
          return ApiResponse.created(c, { room: created });
        } catch (e) {
          if (
            e instanceof Error &&
            (e.message.includes("exists") ||
              e.message.includes("Room type not found"))
          ) {
            const message = e.message.includes("exists")
              ? e.message
              : "Room type not found";
            return ApiResponse.badRequest(c, message);
          }
          throw e;
        }
      },
      "operation.createRoomFailed",
    );
  }

  static async updateRoom(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();
        try {
          const updated = await RoomService.updateRoom(c.env.DB, id, payload);
          return ApiResponse.success(c, { room: updated });
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === "Room not found")
              return ApiResponse.notFound(c, "Room not found");
            if (
              e.message.includes("exists") ||
              e.message.includes("Room type not found")
            )
              return ApiResponse.badRequest(c, e.message);
          }
          throw e;
        }
      },
      "operation.updateRoomFailed",
    );
  }

  static async deleteRoom(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const deleted = await RoomService.deleteRoom(c.env.DB, id);
          if (!deleted) return ApiResponse.notFound(c, "Room not found");
          return ApiResponse.success(c, {});
        } catch (e) {
          if (e instanceof Error && e.message === "Room not found") {
            return ApiResponse.notFound(c, "Room not found");
          }
          throw e;
        }
      },
      "operation.deleteRoomFailed",
    );
  }
}
