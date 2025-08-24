import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { AddonController } from "../controllers/addon.controller";
import { AddonRouteDefinitions } from "../definitions/addon.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const addonRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

addonRoutes.use("*", smartAuthMiddleware);

addonRoutes.openapi(
  AddonRouteDefinitions.getAddons,
  smartPermissionHandler(PERMISSIONS.ADDONS_READ, (c) =>
    AddonController.getAddons(c as AppContext),
  ),
);

addonRoutes.openapi(
  AddonRouteDefinitions.getAddonById,
  smartPermissionHandler(PERMISSIONS.ADDONS_READ, (c) =>
    AddonController.getAddonById(c as AppContext),
  ),
);

addonRoutes.openapi(
  AddonRouteDefinitions.createAddon,
  smartPermissionHandler(PERMISSIONS.ADDONS_CREATE, (c) =>
    AddonController.createAddon(c as AppContext),
  ),
);

addonRoutes.openapi(
  AddonRouteDefinitions.updateAddon,
  smartPermissionHandler(PERMISSIONS.ADDONS_UPDATE, (c) =>
    AddonController.updateAddon(c as AppContext),
  ),
);

addonRoutes.openapi(
  AddonRouteDefinitions.deleteAddon,
  smartPermissionHandler(PERMISSIONS.ADDONS_DELETE, (c) =>
    AddonController.deleteAddon(c as AppContext),
  ),
);

addonRoutes.openapi(
  AddonRouteDefinitions.getAddonConfigurations,
  smartPermissionHandler(PERMISSIONS.ADDONS_READ, (c) =>
    AddonController.getAddonConfigurations(c as AppContext),
  ),
);

addonRoutes.openapi(
  AddonRouteDefinitions.updateAddonConfiguration,
  smartPermissionHandler(PERMISSIONS.ADDONS_UPDATE, (c) =>
    AddonController.updateAddonConfiguration(c as AppContext),
  ),
);

addonRoutes.openapi(
  AddonRouteDefinitions.deleteAddonConfiguration,
  smartPermissionHandler(PERMISSIONS.ADDONS_DELETE, (c) =>
    AddonController.deleteAddonConfiguration(c as AppContext),
  ),
);

export default addonRoutes;
