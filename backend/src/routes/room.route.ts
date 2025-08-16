import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { RoomController } from "../controllers/room.controller";
import { RoomRouteDefinitions } from "../definitions/room.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const roomRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

roomRoutes.use("*", smartAuthMiddleware());

roomRoutes.openapi(
  RoomRouteDefinitions.getRooms,
  smartPermissionHandler(PERMISSIONS.ROOMS_READ, (c) =>
    RoomController.getRooms(c as AppContext),
  ),
);

roomRoutes.openapi(
  RoomRouteDefinitions.getRoomById,
  smartPermissionHandler(PERMISSIONS.ROOMS_READ, (c) =>
    RoomController.getRoomById(c as AppContext),
  ),
);

roomRoutes.openapi(
  RoomRouteDefinitions.createRoom,
  smartPermissionHandler(PERMISSIONS.ROOMS_CREATE, (c) =>
    RoomController.createRoom(c as AppContext),
  ),
);

roomRoutes.openapi(
  RoomRouteDefinitions.updateRoom,
  smartPermissionHandler(PERMISSIONS.ROOMS_UPDATE, (c) =>
    RoomController.updateRoom(c as AppContext),
  ),
);

roomRoutes.openapi(
  RoomRouteDefinitions.deleteRoom,
  smartPermissionHandler(PERMISSIONS.ROOMS_DELETE, (c) =>
    RoomController.deleteRoom(c as AppContext),
  ),
);

export default roomRoutes;
