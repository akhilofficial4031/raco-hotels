import { OpenAPIHono } from "@hono/zod-openapi";
import { CustomerController } from "../controllers/customer.controller";
import { CustomerRouteDefinitions } from "../definitions/customer.definition";
import { smartAuthMiddleware } from "../middleware/smart-auth";
import { rbacMiddleware } from "../middleware/rbac";
import type { AppBindings, AppVariables } from "../types";

const customerRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Apply authentication middleware to all customer routes
customerRoutes.use("*", smartAuthMiddleware);

// Create customer
customerRoutes.openapi(
  CustomerRouteDefinitions.create,
  rbacMiddleware(["customers.create"]),
  CustomerController.create,
);

// Get customer by ID
customerRoutes.openapi(
  CustomerRouteDefinitions.getById,
  rbacMiddleware(["customers.read"]),
  CustomerController.getById,
);

// Update customer
customerRoutes.openapi(
  CustomerRouteDefinitions.update,
  rbacMiddleware(["customers.update"]),
  CustomerController.update,
);

// Delete customer (soft delete)
customerRoutes.openapi(
  CustomerRouteDefinitions.delete,
  rbacMiddleware(["customers.delete"]),
  CustomerController.delete,
);

// Search customers
customerRoutes.openapi(
  CustomerRouteDefinitions.search,
  rbacMiddleware(["customers.read"]),
  CustomerController.search,
);

// Get customer booking history
customerRoutes.openapi(
  CustomerRouteDefinitions.getBookingHistory,
  rbacMiddleware(["customers.read", "bookings.read"]),
  CustomerController.getBookingHistory,
);

// Get customer statistics
customerRoutes.openapi(
  CustomerRouteDefinitions.getStats,
  rbacMiddleware(["customers.read"]),
  CustomerController.getStats,
);

// Find customer by email
customerRoutes.openapi(
  CustomerRouteDefinitions.findByEmail,
  rbacMiddleware(["customers.read"]),
  CustomerController.getByEmail,
);

// Find or create customer
customerRoutes.openapi(
  CustomerRouteDefinitions.findOrCreate,
  rbacMiddleware(["customers.read", "customers.create"]),
  CustomerController.findOrCreate,
);

export default customerRoutes;
