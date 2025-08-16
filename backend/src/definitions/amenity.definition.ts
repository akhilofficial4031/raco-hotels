import { ApiTags, createRoute } from "../lib/route-wrapper";
import {
  AmenitiesListResponseSchema,
  AmenityPathParamsSchema,
  AmenityQueryParamsSchema,
  AmenityResponseSchema,
  CreateAmenityRequestSchema,
  UpdateAmenityRequestSchema,
} from "../schemas";

export const AmenityRouteDefinitions = {
  getAmenities: createRoute({
    method: "get",
    path: "/amenities",
    summary: "Get all amenities",
    description:
      "Retrieve a list of amenities with optional filters and pagination",
    tags: [ApiTags.AMENITIES],
    successSchema: AmenitiesListResponseSchema,
    successDescription: "Amenities retrieved successfully",
    querySchema: AmenityQueryParamsSchema,
    includeBadRequest: true,
  }),
  getAmenityById: createRoute({
    method: "get",
    path: "/amenities/{id}",
    summary: "Get amenity by ID",
    description: "Retrieve a specific amenity by its ID",
    tags: [ApiTags.AMENITIES],
    successSchema: AmenityResponseSchema,
    successDescription: "Amenity retrieved successfully",
    paramsSchema: AmenityPathParamsSchema,
    includeNotFound: true,
  }),
  createAmenity: createRoute({
    method: "post",
    path: "/amenities",
    summary: "Create amenity",
    description: "Create a new amenity",
    tags: [ApiTags.AMENITIES],
    successSchema: AmenityResponseSchema,
    successDescription: "Amenity created successfully",
    requestSchema: CreateAmenityRequestSchema,
    includeBadRequest: true,
    includeConflict: true,
  }),

  updateAmenity: createRoute({
    method: "put",
    path: "/amenities/{id}",
    summary: "Update amenity",
    description: "Update an existing amenity",
    tags: [ApiTags.AMENITIES],
    successSchema: AmenityResponseSchema,
    successDescription: "Amenity updated successfully",
    paramsSchema: AmenityPathParamsSchema,
    requestSchema: UpdateAmenityRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
    includeConflict: true,
  }),

  deleteAmenity: createRoute({
    method: "delete",
    path: "/amenities/{id}",
    summary: "Delete amenity",
    description: "Delete an existing amenity",
    tags: [ApiTags.AMENITIES],
    successSchema: AmenityResponseSchema,
    successDescription: "Amenity deleted successfully",
    paramsSchema: AmenityPathParamsSchema,
    includeNotFound: true,
  }),
};
