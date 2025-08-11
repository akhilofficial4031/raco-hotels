import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { ContentController } from "../controllers/content.controller";
import { ContentRouteDefinitions } from "../definitions/content.definition";
import { authMiddleware, csrfMiddleware } from "../middleware";
import { assertPermission } from "../middleware/permissions";

import type { AppBindings, AppVariables } from "../types";

const contentRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

contentRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  await authMiddleware(c, async () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      await csrfMiddleware(c, next);
    } else {
      await next();
    }
  });
});

contentRoutes.openapi(ContentRouteDefinitions.getContentBlocks, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_READ);
  return ContentController.getContentBlocks(c as any);
});

contentRoutes.openapi(
  ContentRouteDefinitions.getContentBlockById,
  async (c) => {
    await assertPermission(c, PERMISSIONS.HOTELS_READ);
    return ContentController.getContentBlockById(c as any);
  },
);

contentRoutes.openapi(ContentRouteDefinitions.createContentBlock, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_CREATE);
  return ContentController.createContentBlock(c as any);
});

contentRoutes.openapi(ContentRouteDefinitions.updateContentBlock, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_UPDATE);
  return ContentController.updateContentBlock(c as any);
});

contentRoutes.openapi(ContentRouteDefinitions.deleteContentBlock, async (c) => {
  await assertPermission(c, PERMISSIONS.HOTELS_DELETE);
  return ContentController.deleteContentBlock(c as any);
});

export default contentRoutes;
