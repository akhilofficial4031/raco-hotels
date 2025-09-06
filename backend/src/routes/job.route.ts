import { OpenAPIHono } from "@hono/zod-openapi";

import { JobController } from "../controllers/job.controller";
import { JobRouteDefinitions } from "../definitions/job.definition";

import type { AppBindings, AppContext, AppVariables } from "../types";

const jobRoutes = new OpenAPIHono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

jobRoutes.openapi(JobRouteDefinitions.deactivateExpiredPromoCodes, (c) =>
  JobController.deactivateExpiredPromoCodes(c as AppContext),
);

export default jobRoutes;
