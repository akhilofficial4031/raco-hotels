import { OpenAPIHono } from "@hono/zod-openapi";

import { RoomController } from "../controllers/room.controller";
import { RoomPublicRouteDefinitions } from "../definitions/room_public.definition";

import type { AppBindings, AppContext, AppVariables } from "../types";

const roomPublicRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// This route is fully public - no authentication required
// Public room information accessible to everyone
roomPublicRoutes.openapi(RoomPublicRouteDefinitions.getRoomDetails, (c) =>
  RoomController.getRoomById(c as AppContext),
);

export default roomPublicRoutes;
