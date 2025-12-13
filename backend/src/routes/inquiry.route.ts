import { OpenAPIHono } from "@hono/zod-openapi";

import { PERMISSIONS } from "../config/permissions";
import { InquiryController } from "../controllers/inquiry.controller";
import { InquiryRouteDefinitions } from "../definitions/inquiry.definition";
import {
  smartAuthMiddleware,
  smartPermissionHandler,
} from "../middleware/smart-auth";

import type { AppBindings, AppContext, AppVariables } from "../types";

const inquiryRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

// Protected routes - require authentication
inquiryRoutes.use("*", smartAuthMiddleware);

// GET /inquiries - List inquiries (protected)
inquiryRoutes.openapi(
  InquiryRouteDefinitions.getInquiries,
  smartPermissionHandler(PERMISSIONS.INQUIRIES_READ, (c) =>
    InquiryController.getInquiries(c as AppContext),
  ),
);

// GET /inquiries/stats - Get inquiry statistics (protected)
inquiryRoutes.openapi(
  InquiryRouteDefinitions.getInquiryStats,
  smartPermissionHandler(PERMISSIONS.INQUIRIES_READ, (c) =>
    InquiryController.getInquiryStats(c as AppContext),
  ),
);

// GET /inquiries/:id - Get inquiry by ID (protected)
inquiryRoutes.openapi(
  InquiryRouteDefinitions.getInquiryById,
  smartPermissionHandler(PERMISSIONS.INQUIRIES_READ, (c) =>
    InquiryController.getInquiryById(c as AppContext),
  ),
);

// PUT /inquiries/:id - Update inquiry (protected)
inquiryRoutes.openapi(
  InquiryRouteDefinitions.updateInquiry,
  smartPermissionHandler(PERMISSIONS.INQUIRIES_UPDATE, (c) =>
    InquiryController.updateInquiry(c as AppContext),
  ),
);

// DELETE /inquiries/:id - Delete inquiry (protected)
inquiryRoutes.openapi(
  InquiryRouteDefinitions.deleteInquiry,
  smartPermissionHandler(PERMISSIONS.INQUIRIES_DELETE, (c) =>
    InquiryController.deleteInquiry(c as AppContext),
  ),
);

// PATCH /inquiries/:id/status - Update inquiry status (protected)
inquiryRoutes.openapi(
  InquiryRouteDefinitions.updateInquiryStatus,
  smartPermissionHandler(PERMISSIONS.INQUIRIES_UPDATE, (c) =>
    InquiryController.updateInquiryStatus(c as AppContext),
  ),
);

// POST /inquiries - Create inquiry (public - no auth required, handled by routes config)
inquiryRoutes.openapi(
  InquiryRouteDefinitions.createInquiry,
  smartPermissionHandler(PERMISSIONS.INQUIRIES_CREATE, (c) =>
    InquiryController.createInquiry(c as AppContext),
  ),
);

export { inquiryRoutes };
