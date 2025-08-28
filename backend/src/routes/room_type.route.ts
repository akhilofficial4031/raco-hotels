import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { RoomTypeController } from "../controllers/room_type.controller";
import { RoomTypeRouteDefinitions } from "../definitions/room_type.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const roomTypeRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

roomTypeRoutes.use("*", smartAuthMiddleware);

roomTypeRoutes.openapi(
  RoomTypeRouteDefinitions.getRoomTypes,
  smartPermissionHandler(PERMISSIONS.ROOM_TYPES_READ, (c) =>
    RoomTypeController.getRoomTypes(c as AppContext),
  ),
);

roomTypeRoutes.openapi(
  RoomTypeRouteDefinitions.getRoomTypeById,
  smartPermissionHandler(PERMISSIONS.ROOM_TYPES_READ, (c) =>
    RoomTypeController.getRoomTypeById(c as AppContext),
  ),
);

roomTypeRoutes.openapi(
  RoomTypeRouteDefinitions.createRoomType,
  smartPermissionHandler(PERMISSIONS.ROOM_TYPES_CREATE, (c) =>
    RoomTypeController.createRoomType(c as AppContext),
  ),
);

roomTypeRoutes.openapi(
  RoomTypeRouteDefinitions.updateRoomType,
  smartPermissionHandler(PERMISSIONS.ROOM_TYPES_UPDATE, (c) =>
    RoomTypeController.updateRoomType(c as AppContext),
  ),
);

roomTypeRoutes.openapi(
  RoomTypeRouteDefinitions.deleteRoomType,
  smartPermissionHandler(PERMISSIONS.ROOM_TYPES_DELETE, (c) =>
    RoomTypeController.deleteRoomType(c as AppContext),
  ),
);

roomTypeRoutes.openapi(
  RoomTypeRouteDefinitions.uploadRoomTypeImages,
  smartPermissionHandler(PERMISSIONS.ROOM_TYPES_UPDATE, (c) =>
    RoomTypeController.uploadRoomTypeImages(c as AppContext),
  ),
);

roomTypeRoutes.openapi(
  RoomTypeRouteDefinitions.deleteRoomTypeImage,
  smartPermissionHandler(PERMISSIONS.ROOM_TYPES_DELETE, (c) =>
    RoomTypeController.deleteRoomTypeImage(c as AppContext),
  ),
);

roomTypeRoutes.openapi(
  RoomTypeRouteDefinitions.updateRoomTypeImageSortOrder,
  smartPermissionHandler(PERMISSIONS.ROOM_TYPES_UPDATE, (c) =>
    RoomTypeController.updateRoomTypeImageSortOrder(c as AppContext),
  ),
);

export default roomTypeRoutes;
