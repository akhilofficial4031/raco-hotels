import { createAuthenticatedRoute, ApiTags } from "../lib/openapi";
import {
  HotelResponseSchema,
  HotelsListResponseSchema,
  CreateHotelRequestSchema,
  UpdateHotelRequestSchema,
  HotelPathParamsSchema,
  HotelQueryParamsSchema,
} from "../schemas";

export const HotelRouteDefinitions = {
  getHotels: createAuthenticatedRoute({
    method: "get",
    path: "/hotels",
    summary: "Get all hotels",
    description:
      "Retrieve a list of hotels with optional filters and pagination",
    tags: [ApiTags.HOTELS],
    successSchema: HotelsListResponseSchema,
    successDescription: "Hotels retrieved successfully",
    querySchema: HotelQueryParamsSchema,
    includeBadRequest: true,
  }),

  getHotelById: createAuthenticatedRoute({
    method: "get",
    path: "/hotels/{id}",
    summary: "Get hotel by ID",
    description: "Retrieve a specific hotel by its ID",
    tags: [ApiTags.HOTELS],
    successSchema: HotelResponseSchema,
    successDescription: "Hotel retrieved successfully",
    paramsSchema: HotelPathParamsSchema,
    includeNotFound: true,
  }),

  createHotel: createAuthenticatedRoute({
    method: "post",
    path: "/hotels",
    summary: "Create hotel",
    description: "Create a new hotel",
    tags: [ApiTags.HOTELS],
    successSchema: HotelResponseSchema,
    successDescription: "Hotel created successfully",
    requestSchema: CreateHotelRequestSchema,
    includeBadRequest: true,
    includeConflict: true,
  }),

  updateHotel: createAuthenticatedRoute({
    method: "put",
    path: "/hotels/{id}",
    summary: "Update hotel",
    description: "Update an existing hotel",
    tags: [ApiTags.HOTELS],
    successSchema: HotelResponseSchema,
    successDescription: "Hotel updated successfully",
    paramsSchema: HotelPathParamsSchema,
    requestSchema: UpdateHotelRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
    includeConflict: true,
  }),

  deleteHotel: createAuthenticatedRoute({
    method: "delete",
    path: "/hotels/{id}",
    summary: "Delete hotel",
    description: "Delete an existing hotel",
    tags: [ApiTags.HOTELS],
    successSchema: HotelResponseSchema,
    successDescription: "Hotel deleted successfully",
    paramsSchema: HotelPathParamsSchema,
    includeNotFound: true,
  }),
};
