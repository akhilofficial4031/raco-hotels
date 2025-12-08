import { ApiTags, createRoute } from "../lib/route-wrapper";
import {
  AttractionsListResponseSchema,
  AttractionPathParamsSchema,
  AttractionSlugParamsSchema,
  AttractionQueryParamsSchema,
  AttractionResponseSchema,
  CreateAttractionRequestSchema,
  UpdateAttractionRequestSchema,
} from "../schemas/attraction.schema";

export const AttractionRouteDefinitions = {
  getAttractions: createRoute({
    method: "get",
    path: "/attractions",
    summary: "Get attractions",
    description: "Retrieve attractions with optional filters",
    tags: [ApiTags.CONTENT],
    successSchema: AttractionsListResponseSchema,
    successDescription: "Attractions retrieved successfully",
    querySchema: AttractionQueryParamsSchema,
    includeBadRequest: true,
  }),

  getAttractionById: createRoute({
    method: "get",
    path: "/attractions/{id}",
    summary: "Get attraction by ID",
    description: "Retrieve attraction by ID",
    tags: [ApiTags.CONTENT],
    successSchema: AttractionResponseSchema,
    successDescription: "Attraction retrieved successfully",
    paramsSchema: AttractionPathParamsSchema,
    includeNotFound: true,
  }),

  getAttractionBySlug: createRoute({
    method: "get",
    path: "/attractions/slug/{slug}",
    summary: "Get attraction by slug",
    description: "Retrieve attraction by slug",
    tags: [ApiTags.CONTENT],
    successSchema: AttractionResponseSchema,
    successDescription: "Attraction retrieved successfully",
    paramsSchema: AttractionSlugParamsSchema,
    includeNotFound: true,
  }),

  createAttraction: createRoute({
    method: "post",
    path: "/attractions",
    summary: "Create attraction",
    description: "Create a new attraction",
    tags: [ApiTags.CONTENT],
    successSchema: AttractionResponseSchema,
    successDescription: "Attraction created successfully",
    requestSchema: CreateAttractionRequestSchema,
    includeBadRequest: true,
  }),

  updateAttraction: createRoute({
    method: "put",
    path: "/attractions/{id}",
    summary: "Update attraction",
    description: "Update an existing attraction",
    tags: [ApiTags.CONTENT],
    successSchema: AttractionResponseSchema,
    successDescription: "Attraction updated successfully",
    paramsSchema: AttractionPathParamsSchema,
    requestSchema: UpdateAttractionRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
  }),

  deleteAttraction: createRoute({
    method: "delete",
    path: "/attractions/{id}",
    summary: "Delete attraction",
    description: "Delete an attraction",
    tags: [ApiTags.CONTENT],
    successSchema: AttractionResponseSchema,
    successDescription: "Attraction deleted successfully",
    paramsSchema: AttractionPathParamsSchema,
    includeNotFound: true,
  }),
};
