import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { RoomController } from "../controllers/room.controller";
import { RoomRouteDefinitions } from "../definitions/room.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

const roomRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

roomRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

roomRoutes.openapi(RoomRouteDefinitions.getRooms, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return RoomController.getRooms(c as any);
});

roomRoutes.openapi(RoomRouteDefinitions.getRoomById, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return RoomController.getRoomById(c as any);
});

roomRoutes.openapi(RoomRouteDefinitions.createRoom, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_CREATE);
  return RoomController.createRoom(c as any);
});

roomRoutes.openapi(RoomRouteDefinitions.updateRoom, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
  return RoomController.updateRoom(c as any);
});

roomRoutes.openapi(RoomRouteDefinitions.deleteRoom, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_DELETE);
  return RoomController.deleteRoom(c as any);
});

export default roomRoutes;
