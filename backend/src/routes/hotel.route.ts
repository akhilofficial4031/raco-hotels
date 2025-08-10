import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { HotelController } from "../controllers/hotel.controller";
import { HotelRouteDefinitions } from "../definitions/hotel.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

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
  return HotelController.getHotels(c as any);
});

hotelRoutes.openapi(HotelRouteDefinitions.getHotelById, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return HotelController.getHotelById(c as any);
});

hotelRoutes.openapi(HotelRouteDefinitions.createHotel, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_CREATE);
  return HotelController.createHotel(c as any);
});

hotelRoutes.openapi(HotelRouteDefinitions.updateHotel, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
  return HotelController.updateHotel(c as any);
});

hotelRoutes.openapi(HotelRouteDefinitions.deleteHotel, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_DELETE);
  return HotelController.deleteHotel(c as any);
});

export default hotelRoutes;
