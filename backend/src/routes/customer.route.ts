import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { CustomerController } from "../controllers/customer.controller";
import { CustomerRouteDefinitions } from "../definitions/customer.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const customerRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Apply authentication middleware to all customer routes
customerRoutes.use("*", smartAuthMiddleware);

// Create customer
customerRoutes.openapi(
  CustomerRouteDefinitions.create,
  smartPermissionHandler(PERMISSIONS.CUSTOMERS_CREATE, (c) =>
    CustomerController.create(c as AppContext),
  ),
);

// Get customer by ID
customerRoutes.openapi(
  CustomerRouteDefinitions.getById,
  smartPermissionHandler(PERMISSIONS.CUSTOMERS_READ, (c) =>
    CustomerController.getById(c as AppContext),
  ),
);

// Update customer
customerRoutes.openapi(
  CustomerRouteDefinitions.update,
  smartPermissionHandler(PERMISSIONS.CUSTOMERS_UPDATE, (c) =>
    CustomerController.update(c as AppContext),
  ),
);

// Delete customer (soft delete)
customerRoutes.openapi(
  CustomerRouteDefinitions.delete,
  smartPermissionHandler(PERMISSIONS.CUSTOMERS_DELETE, (c) =>
    CustomerController.delete(c as AppContext),
  ),
);

// Search customers
// customerRoutes.openapi(
//   CustomerRouteDefinitions.search,
//   smartPermissionHandler(PERMISSIONS.CUSTOMERS_READ, (c) =>
//     CustomerController.search(c as AppContext),
//   ),
// );

// Get customer booking history
customerRoutes.openapi(
  CustomerRouteDefinitions.getBookingHistory,
  smartPermissionHandler(PERMISSIONS.CUSTOMERS_READ, (c) =>
    CustomerController.getBookingHistory(c as AppContext),
  ),
);

// Get customer statistics
customerRoutes.openapi(
  CustomerRouteDefinitions.getStats,
  smartPermissionHandler(PERMISSIONS.CUSTOMERS_READ, (c) =>
    CustomerController.getStats(c as AppContext),
  ),
);

// Find customer by email
// customerRoutes.openapi(
//   CustomerRouteDefinitions.findByEmail,
//   smartPermissionHandler(PERMISSIONS.CUSTOMERS_READ, (c) =>
//     CustomerController.getByEmail(c as AppContext),
//   ),
// );

// Find or create customer
customerRoutes.openapi(
  CustomerRouteDefinitions.findOrCreate,
  smartPermissionHandler(PERMISSIONS.CUSTOMERS_READ, (c) =>
    CustomerController.findOrCreate(c as AppContext),
  ),
);

export default customerRoutes;
