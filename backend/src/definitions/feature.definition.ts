import { ApiTags, createRoute } from "../lib/route-wrapper";
import {
  FeaturesListResponseSchema,
  FeaturePathParamsSchema,
  FeatureQueryParamsSchema,
  FeatureResponseSchema,
  CreateFeatureRequestSchema,
  UpdateFeatureRequestSchema,
} from "../schemas";

export const FeatureRouteDefinitions = {
  getFeatures: createRoute({
    method: "get",
    path: "/features",
    summary: "Get all features",
    description:
      "Retrieve a list of features with optional filters and pagination",
    tags: [ApiTags.FEATURES],
    successSchema: FeaturesListResponseSchema,
    successDescription: "Features retrieved successfully",
    querySchema: FeatureQueryParamsSchema,
    includeBadRequest: true,
  }),
  getFeatureById: createRoute({
    method: "get",
    path: "/features/{id}",
    summary: "Get feature by ID",
    description: "Retrieve a specific feature by its ID",
    tags: [ApiTags.FEATURES],
    successSchema: FeatureResponseSchema,
    successDescription: "Feature retrieved successfully",
    paramsSchema: FeaturePathParamsSchema,
    includeNotFound: true,
  }),
  createFeature: createRoute({
    method: "post",
    path: "/features",
    summary: "Create feature",
    description: "Create a new feature",
    tags: [ApiTags.FEATURES],
    successSchema: FeatureResponseSchema,
    successDescription: "Feature created successfully",
    requestSchema: CreateFeatureRequestSchema,
    includeBadRequest: true,
    includeConflict: true,
  }),

  updateFeature: createRoute({
    method: "put",
    path: "/features/{id}",
    summary: "Update feature",
    description: "Update an existing feature",
    tags: [ApiTags.FEATURES],
    successSchema: FeatureResponseSchema,
    successDescription: "Feature updated successfully",
    paramsSchema: FeaturePathParamsSchema,
    requestSchema: UpdateFeatureRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
    includeConflict: true,
  }),

  deleteFeature: createRoute({
    method: "delete",
    path: "/features/{id}",
    summary: "Delete feature",
    description: "Delete an existing feature",
    tags: [ApiTags.FEATURES],
    successSchema: FeatureResponseSchema,
    successDescription: "Feature deleted successfully",
    paramsSchema: FeaturePathParamsSchema,
    includeNotFound: true,
  }),
};
