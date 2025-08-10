import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { HotelController } from "../controllers/hotel.controller";
import { HotelRouteDefinitions } from "../definitions/hotel.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables, AppContext } from "../types";
import type { RouteConfigToTypedResponse } from "@hono/zod-openapi";

const hotelRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

hotelRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

hotelRoutes.openapi(HotelRouteDefinitions.getHotels, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return HotelController.getHotels(c as AppContext);
});

hotelRoutes.openapi(HotelRouteDefinitions.getHotelById, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return HotelController.getHotelById(c as AppContext);
});

hotelRoutes.openapi(HotelRouteDefinitions.createHotel, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_CREATE);
  return HotelController.createHotel(c as AppContext);
});

hotelRoutes.openapi(HotelRouteDefinitions.updateHotel, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
  return HotelController.updateHotel(c as AppContext);
});

hotelRoutes.openapi(HotelRouteDefinitions.deleteHotel, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_DELETE);
  return HotelController.deleteHotel(c as AppContext);
});

// Hotel with images routes
hotelRoutes.openapi(HotelRouteDefinitions.getHotelWithImages, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return HotelController.getHotelWithImages(c as AppContext);
});

hotelRoutes.openapi(HotelRouteDefinitions.createHotelWithImages, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_CREATE);
  return (await HotelController.createHotelWithImages(
    c as AppContext,
  )) as unknown as RouteConfigToTypedResponse<
    typeof HotelRouteDefinitions.createHotelWithImages
  >;
});

hotelRoutes.openapi(HotelRouteDefinitions.updateHotelWithImages, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
  return (await HotelController.updateHotelWithImages(
    c as AppContext,
  )) as unknown as RouteConfigToTypedResponse<
    typeof HotelRouteDefinitions.updateHotelWithImages
  >;
});

// Hotel image management routes
hotelRoutes.openapi(HotelRouteDefinitions.getHotelImages, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return HotelController.getHotelImages(c as AppContext);
});

hotelRoutes.openapi(HotelRouteDefinitions.addHotelImage, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
  return (await HotelController.addHotelImage(
    c as AppContext,
  )) as unknown as RouteConfigToTypedResponse<
    typeof HotelRouteDefinitions.addHotelImage
  >;
});

hotelRoutes.openapi(HotelRouteDefinitions.deleteHotelImage, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_DELETE);
  return HotelController.deleteHotelImage(c as AppContext);
});

hotelRoutes.openapi(HotelRouteDefinitions.updateImageSortOrder, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
  return HotelController.updateImageSortOrder(c as AppContext);
});

export default hotelRoutes;
