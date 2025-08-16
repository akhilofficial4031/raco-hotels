import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { HotelController } from "../controllers/hotel.controller";
import { HotelRouteDefinitions } from "../definitions/hotel.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppVariables, AppContext } from "../types";
import type { RouteConfigToTypedResponse } from "@hono/zod-openapi";

const hotelRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Use smartAuthMiddleware to automatically handle public/protected routes
hotelRoutes.use("*", smartAuthMiddleware());

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

// Hotel with images routes
hotelRoutes.openapi(
  HotelRouteDefinitions.getHotelWithImages,
  smartPermissionHandler(PERMISSIONS.HOTELS_READ, (c) =>
    HotelController.getHotelWithImages(c as AppContext),
  ),
);

hotelRoutes.openapi(
  HotelRouteDefinitions.createHotelWithImages,
  smartPermissionHandler(
    PERMISSIONS.HOTELS_CREATE,
    async (c) =>
      (await HotelController.createHotelWithImages(
        c as AppContext,
      )) as unknown as RouteConfigToTypedResponse<
        typeof HotelRouteDefinitions.createHotelWithImages
      >,
  ),
);

hotelRoutes.openapi(
  HotelRouteDefinitions.updateHotelWithImages,
  smartPermissionHandler(
    PERMISSIONS.HOTELS_UPDATE,
    async (c) =>
      (await HotelController.updateHotelWithImages(
        c as AppContext,
      )) as unknown as RouteConfigToTypedResponse<
        typeof HotelRouteDefinitions.updateHotelWithImages
      >,
  ),
);

// Hotel image management routes
hotelRoutes.openapi(
  HotelRouteDefinitions.getHotelImages,
  smartPermissionHandler(PERMISSIONS.HOTELS_READ, (c) =>
    HotelController.getHotelImages(c as AppContext),
  ),
);

hotelRoutes.openapi(
  HotelRouteDefinitions.addHotelImage,
  smartPermissionHandler(
    PERMISSIONS.HOTELS_UPDATE,
    async (c) =>
      (await HotelController.addHotelImage(
        c as AppContext,
      )) as unknown as RouteConfigToTypedResponse<
        typeof HotelRouteDefinitions.addHotelImage
      >,
  ),
);

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
