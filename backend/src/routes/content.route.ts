import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { ContentController } from "../controllers/content.controller";
import { ContentRouteDefinitions } from "../definitions/content.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const contentRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

contentRoutes.use("*", smartAuthMiddleware());

contentRoutes.openapi(
  ContentRouteDefinitions.getContentBlocks,
  smartPermissionHandler(PERMISSIONS.CONTENT_READ, (c) =>
    ContentController.getContentBlocks(c as AppContext),
  ),
);

contentRoutes.openapi(
  ContentRouteDefinitions.getContentBlockById,
  smartPermissionHandler(PERMISSIONS.CONTENT_READ, (c) =>
    ContentController.getContentBlockById(c as AppContext),
  ),
);

contentRoutes.openapi(
  ContentRouteDefinitions.createContentBlock,
  smartPermissionHandler(PERMISSIONS.CONTENT_CREATE, (c) =>
    ContentController.createContentBlock(c as AppContext),
  ),
);

contentRoutes.openapi(
  ContentRouteDefinitions.updateContentBlock,
  smartPermissionHandler(PERMISSIONS.CONTENT_UPDATE, (c) =>
    ContentController.updateContentBlock(c as AppContext),
  ),
);

contentRoutes.openapi(
  ContentRouteDefinitions.deleteContentBlock,
  smartPermissionHandler(PERMISSIONS.CONTENT_DELETE, (c) =>
    ContentController.deleteContentBlock(c as AppContext),
  ),
);

export default contentRoutes;
