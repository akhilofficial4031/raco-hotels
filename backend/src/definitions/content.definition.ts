import { ApiTags, createRoute } from "../lib/route-wrapper";
import {
  ContentBlocksListResponseSchema,
  ContentBlockPathParamsSchema,
  ContentBlockQueryParamsSchema,
  ContentBlockResponseSchema,
  CreateContentBlockRequestSchema,
  UpdateContentBlockRequestSchema,
  HomepageContentQueryParamsSchema,
  HomepageContentResponseSchema,
  SaveHomepageContentRequestSchema,
  PublicHomepageContentResponseSchema,
  TopBannerResponseSchema,
} from "../schemas";

export const ContentRouteDefinitions = {
  getContentBlocks: createRoute({
    method: "get",
    path: "/content-blocks",
    summary: "Get content blocks",
    description: "Retrieve content blocks with optional filters",
    tags: [ApiTags.CONTENT],
    successSchema: ContentBlocksListResponseSchema,
    successDescription: "Content blocks retrieved successfully",
    querySchema: ContentBlockQueryParamsSchema,
    includeBadRequest: true,
  }),
  getContentBlockById: createRoute({
    method: "get",
    path: "/content-blocks/{id}",
    summary: "Get content block",
    description: "Retrieve content block by ID",
    tags: [ApiTags.CONTENT],
    successSchema: ContentBlockResponseSchema,
    successDescription: "Content block retrieved successfully",
    paramsSchema: ContentBlockPathParamsSchema,
    includeNotFound: true,
  }),
  createContentBlock: createRoute({
    method: "post",
    path: "/content-blocks",
    summary: "Create content block",
    description: "Create a new CMS content block",
    tags: [ApiTags.CONTENT],
    successSchema: ContentBlockResponseSchema,
    successDescription: "Content block created successfully",
    requestSchema: CreateContentBlockRequestSchema,
    includeBadRequest: true,
  }),
  updateContentBlock: createRoute({
    method: "put",
    path: "/content-blocks/{id}",
    summary: "Update content block",
    description: "Update an existing CMS content block",
    tags: [ApiTags.CONTENT],
    successSchema: ContentBlockResponseSchema,
    successDescription: "Content block updated successfully",
    paramsSchema: ContentBlockPathParamsSchema,
    requestSchema: UpdateContentBlockRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
  }),
  deleteContentBlock: createRoute({
    method: "delete",
    path: "/content-blocks/{id}",
    summary: "Delete content block",
    description: "Delete a CMS content block",
    tags: [ApiTags.CONTENT],
    successSchema: ContentBlockResponseSchema,
    successDescription: "Content block deleted successfully",
    paramsSchema: ContentBlockPathParamsSchema,
    includeNotFound: true,
  }),

  // Homepage Content Routes
  getHomepageContent: createRoute({
    method: "get",
    path: "/content/homepage",
    summary: "Get homepage content",
    description:
      "Retrieve complete homepage content structure with all sections",
    tags: [ApiTags.CONTENT],
    successSchema: HomepageContentResponseSchema,
    successDescription: "Homepage content retrieved successfully",
    includeNotFound: true,
  }),

  saveHomepageContent: createRoute({
    method: "put",
    path: "/content/homepage",
    summary: "Save homepage content",
    description:
      "Save or update complete homepage content. Images will be automatically uploaded to R2 storage.",
    tags: [ApiTags.CONTENT],
    successSchema: HomepageContentResponseSchema,
    successDescription: "Homepage content saved successfully",
    requestSchema: SaveHomepageContentRequestSchema,
    includeBadRequest: true,
  }),

  // Public API - No authentication required
  getPublicHomepageContent: createRoute({
    method: "get",
    path: "/public/homepage",
    summary: "Get public homepage content",
    description:
      "Retrieve complete homepage content with testimonials for public website. No authentication required.",
    tags: [ApiTags.CONTENT],
    successSchema: PublicHomepageContentResponseSchema,
    successDescription: "Public homepage content retrieved successfully",
    includeNotFound: true,
  }),

  // Public API - Get only topBanner section
  getTopBanner: createRoute({
    method: "get",
    path: "/public/top-banner",
    summary: "Get top banner content",
    description:
      "Retrieve only the top banner section from homepage content. No authentication required.",
    tags: [ApiTags.CONTENT],
    successSchema: TopBannerResponseSchema,
    successDescription: "Top banner content retrieved successfully",
    includeNotFound: true,
  }),
};
