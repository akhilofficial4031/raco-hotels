import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { DashboardController } from "../controllers/dashboard.controller";
import { DashboardRouteDefinitions } from "../definitions/dashboard.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppVariables, AppContext } from "../types";

const dashboardRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

dashboardRoutes.use("*", smartAuthMiddleware);

dashboardRoutes.openapi(
  DashboardRouteDefinitions.getStats,
  smartPermissionHandler(PERMISSIONS.DASHBOARD_READ, (c) =>
    DashboardController.getStats(c as AppContext),
  ),
);

dashboardRoutes.openapi(
  DashboardRouteDefinitions.getYearlyBookings,
  smartPermissionHandler(PERMISSIONS.DASHBOARD_READ, (c) =>
    DashboardController.getYearlyBookings(c as AppContext),
  ),
);

export default dashboardRoutes;
