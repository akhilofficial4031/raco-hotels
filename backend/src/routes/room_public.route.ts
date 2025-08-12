import { OpenAPIHono } from "@hono/zod-openapi";

import { RoomController } from "../controllers/room.controller";
import { RoomPublicRouteDefinitions } from "../definitions/room_public.definition";
import { optionalAuthMiddleware } from "../middleware/auth";

import type { AppBindings, AppVariables } from "../types";

const roomPublicRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

roomPublicRoutes.use("*", optionalAuthMiddleware);

roomPublicRoutes.openapi(RoomPublicRouteDefinitions.getRoomDetails, (c) =>
  RoomController.getRoomById(c as any),
);

export default roomPublicRoutes;
