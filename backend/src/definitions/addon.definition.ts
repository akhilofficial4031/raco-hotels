import { ApiTags, createRoute } from "../lib/route-wrapper";
import {
  AddonsListResponseSchema,
  AddonPathParamsSchema,
  AddonQueryParamsSchema,
  AddonResponseSchema,
  CreateAddonRequestSchema,
  UpdateAddonRequestSchema,
} from "../schemas";

export const AddonRouteDefinitions = {
  getAddons: createRoute({
    method: "get",
    path: "/addons",
    summary: "Get all addons",
    description:
      "Retrieve a list of addons with optional filters and pagination",
    tags: [ApiTags.ADDONS],
    successSchema: AddonsListResponseSchema,
    successDescription: "Addons retrieved successfully",
    querySchema: AddonQueryParamsSchema,
    includeBadRequest: true,
  }),
  getAddonById: createRoute({
    method: "get",
    path: "/addons/{id}",
    summary: "Get addon by ID",
    description: "Retrieve a specific addon by its ID",
    tags: [ApiTags.ADDONS],
    successSchema: AddonResponseSchema,
    successDescription: "Addon retrieved successfully",
    paramsSchema: AddonPathParamsSchema,
    includeNotFound: true,
  }),
  createAddon: createRoute({
    method: "post",
    path: "/addons",
    summary: "Create addon",
    description: "Create a new addon",
    tags: [ApiTags.ADDONS],
    successSchema: AddonResponseSchema,
    successDescription: "Addon created successfully",
    requestSchema: CreateAddonRequestSchema,
    includeBadRequest: true,
    includeConflict: true,
  }),

  updateAddon: createRoute({
    method: "put",
    path: "/addons/{id}",
    summary: "Update addon",
    description: "Update an existing addon",
    tags: [ApiTags.ADDONS],
    successSchema: AddonResponseSchema,
    successDescription: "Addon updated successfully",
    paramsSchema: AddonPathParamsSchema,
    requestSchema: UpdateAddonRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
    includeConflict: true,
  }),

  deleteAddon: createRoute({
    method: "delete",
    path: "/addons/{id}",
    summary: "Delete addon",
    description: "Delete an existing addon",
    tags: [ApiTags.ADDONS],
    successSchema: AddonResponseSchema,
    successDescription: "Addon deleted successfully",
    paramsSchema: AddonPathParamsSchema,
    includeNotFound: true,
  }),
};
