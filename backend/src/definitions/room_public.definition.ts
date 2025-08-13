import { ApiTags, createPublicRoute } from "../lib/openapi";
import { RoomPathParamsSchema, RoomResponseSchema } from "../schemas";

export const RoomPublicRouteDefinitions = {
  getRoomDetails: createPublicRoute({
    method: "get",
    path: "/public/rooms/{id}",
    summary: "Public room details",
    description:
      "Get room details including images, amenities, max guests, and pricing hints",
    tags: [ApiTags.ROOMS],
    successSchema: RoomResponseSchema,
    successDescription: "Room details retrieved",
    paramsSchema: RoomPathParamsSchema,
    includeNotFound: true,
  }),
};
