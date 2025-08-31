import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { HotelController } from "../controllers/hotel.controller";
import { HotelRouteDefinitions } from "../definitions/hotel.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppVariables, AppContext } from "../types";

const hotelRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Use smartAuthMiddleware to automatically handle public/protected routes
hotelRoutes.use("*", smartAuthMiddleware);

// All route handlers now use smartPermissionHandler for automatic permission checking
hotelRoutes.openapi(
  HotelRouteDefinitions.getHotels,
  smartPermissionHandler(PERMISSIONS.HOTELS_READ, (c) =>
    HotelController.getHotels(c as AppContext),
  ),
);

hotelRoutes.openapi(
  HotelRouteDefinitions.getHotelById,
  smartPermissionHandler(PERMISSIONS.HOTELS_READ, (c) =>
    HotelController.getHotelById(c as AppContext),
  ),
);

hotelRoutes.openapi(
  HotelRouteDefinitions.createHotel,
  smartPermissionHandler(PERMISSIONS.HOTELS_CREATE, (c) =>
    HotelController.createHotel(c as AppContext),
  ),
);

hotelRoutes.openapi(
  HotelRouteDefinitions.updateHotel,
  smartPermissionHandler(PERMISSIONS.HOTELS_UPDATE, (c) =>
    HotelController.updateHotel(c as AppContext),
  ),
);

hotelRoutes.openapi(
  HotelRouteDefinitions.deleteHotel,
  smartPermissionHandler(PERMISSIONS.HOTELS_DELETE, (c) =>
    HotelController.deleteHotel(c as AppContext),
  ),
);

// Individual image management routes (for advanced operations)

hotelRoutes.openapi(
  HotelRouteDefinitions.deleteHotelImage,
  smartPermissionHandler(PERMISSIONS.HOTELS_DELETE, (c) =>
    HotelController.deleteHotelImage(c as AppContext),
  ),
);

hotelRoutes.openapi(
  HotelRouteDefinitions.updateImageSortOrder,
  smartPermissionHandler(PERMISSIONS.HOTELS_UPDATE, (c) =>
    HotelController.updateImageSortOrder(c as AppContext),
  ),
);

export default hotelRoutes;
