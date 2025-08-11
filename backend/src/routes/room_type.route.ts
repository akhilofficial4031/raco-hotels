import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { RoomTypeController } from "../controllers/room_type.controller";
import { RoomTypeRouteDefinitions } from "../definitions/room_type.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

const roomTypeRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

roomTypeRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

roomTypeRoutes.openapi(RoomTypeRouteDefinitions.getRoomTypes, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return RoomTypeController.getRoomTypes(c as any);
});

roomTypeRoutes.openapi(RoomTypeRouteDefinitions.getRoomTypeById, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return RoomTypeController.getRoomTypeById(c as any);
});

roomTypeRoutes.openapi(RoomTypeRouteDefinitions.createRoomType, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_CREATE);
  return RoomTypeController.createRoomType(c as any);
});

roomTypeRoutes.openapi(RoomTypeRouteDefinitions.updateRoomType, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
  return RoomTypeController.updateRoomType(c as any);
});

roomTypeRoutes.openapi(RoomTypeRouteDefinitions.deleteRoomType, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_DELETE);
  return RoomTypeController.deleteRoomType(c as any);
});

export default roomTypeRoutes;
