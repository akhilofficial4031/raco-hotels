import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { RoomController } from "../controllers/room.controller";
import { RoomPublicRouteDefinitions } from "../definitions/room_public.definition";
import {
  optionalSmartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const roomPublicRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// This route can be public, so we use optional middleware
roomPublicRoutes.use("*", optionalSmartAuthMiddleware);

// Search public room information
roomPublicRoutes.openapi(
  RoomPublicRouteDefinitions.getRoomDetails,
  smartPermissionHandler(PERMISSIONS.ROOMS_READ, (c) =>
    RoomController.getRoomById(c as AppContext),
  ),
);

export default roomPublicRoutes;
