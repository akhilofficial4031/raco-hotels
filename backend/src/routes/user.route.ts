import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { UserController } from "../controllers/user.controller";
import { UserRouteDefinitions } from "../definitions/user.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

// Create user routes with OpenAPI support
const userRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// hotelRoutes.openapi(
//   HotelRouteDefinitions.getHotels,
//   smartPermissionHandler(PERMISSIONS.HOTELS_READ, (c) =>
//     HotelController.getHotels(c as AppContext),
//   ),
// );

userRoutes.use("*", smartAuthMiddleware());

userRoutes.openapi(
  UserRouteDefinitions.getUsers,
  smartPermissionHandler(PERMISSIONS.USERS_READ, (c) =>
    UserController.getUsers(c as AppContext),
  ),
);

userRoutes.openapi(
  UserRouteDefinitions.getUserById,
  smartPermissionHandler(PERMISSIONS.USERS_READ, (c) =>
    UserController.getUserById(c as AppContext),
  ),
);

userRoutes.openapi(
  UserRouteDefinitions.createUser,
  smartPermissionHandler(PERMISSIONS.USERS_CREATE, (c) =>
    UserController.createUser(c as AppContext),
  ),
);

userRoutes.openapi(
  UserRouteDefinitions.updateUser,
  smartPermissionHandler(PERMISSIONS.USERS_UPDATE, (c) =>
    UserController.updateUser(c as AppContext),
  ),
);

userRoutes.openapi(
  UserRouteDefinitions.deleteUser,
  smartPermissionHandler(PERMISSIONS.USERS_DELETE, (c) =>
    UserController.deleteUser(c as AppContext),
  ),
);

userRoutes.openapi(
  UserRouteDefinitions.toggleUserStatus,
  smartPermissionHandler(PERMISSIONS.USERS_UPDATE, (c) =>
    UserController.toggleUserStatus(c as AppContext),
  ),
);

userRoutes.openapi(
  UserRouteDefinitions.searchUsers,
  smartPermissionHandler(PERMISSIONS.USERS_READ, (c) =>
    UserController.searchUsers(c as AppContext),
  ),
);

userRoutes.openapi(
  UserRouteDefinitions.getUserStats,
  smartPermissionHandler(PERMISSIONS.USERS_READ, (c) =>
    UserController.getUserStats(c as AppContext),
  ),
);

export default userRoutes;
