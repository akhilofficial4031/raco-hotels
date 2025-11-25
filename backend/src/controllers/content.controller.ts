import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { ContentService } from "../services/content.service";

import type { AppContext } from "../types";

export class ContentController {
  static async getContentBlocks(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const result = await ContentService.getContentBlocks(
          c.env.DB,
          query as any,
        );
        return ApiResponse.success(c, { contentBlocks: result.items });
      },
      "operation.fetchContentBlocksFailed",
    );
  }

  static async getContentBlockById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await ContentService.getContentBlockById(c.env.DB, id);
        if (!item) return ApiResponse.notFound(c, "content.blockNotFound");
        return ApiResponse.success(c, { contentBlock: item });
      },
      "operation.fetchContentBlockFailed",
    );
  }

  static async createContentBlock(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        const created = await ContentService.createContentBlock(
          c.env.DB,
          payload,
        );
        return ApiResponse.created(c, { contentBlock: created });
      },
      "operation.createContentBlockFailed",
    );
  }

  static async updateContentBlock(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();
        try {
          const updated = await ContentService.updateContentBlock(
            c.env.DB,
            id,
            payload,
          );
          return ApiResponse.success(c, { contentBlock: updated });
        } catch (e) {
          if (e instanceof Error && e.message === "Content block not found")
            return ApiResponse.notFound(c, "content.blockNotFound");
          throw e;
        }
      },
      "operation.updateContentBlockFailed",
    );
  }

  static async deleteContentBlock(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const deleted = await ContentService.deleteContentBlock(c.env.DB, id);
          if (!deleted) return ApiResponse.notFound(c, "content.blockNotFound");
          return ApiResponse.success(c, {});
        } catch (e) {
          if (e instanceof Error && e.message === "Content block not found")
            return ApiResponse.notFound(c, "content.blockNotFound");
          throw e;
        }
      },
      "operation.deleteContentBlockFailed",
    );
  }

  // Homepage Content Methods
  static async getHomepageContent(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const content = await ContentService.getHomepageContent(c.env.DB);

        if (!content) {
          return ApiResponse.notFound(c, "content.homepageNotFound");
        }

        return ApiResponse.success(c, content);
      },
      "operation.fetchHomepageContentFailed",
    );
  }

  static async saveHomepageContent(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();

        // Get R2 bucket and public URL from environment
        const r2Bucket = c.env.R2_BUCKET;
        const publicBaseUrl = c.env.R2_PUBLIC_BASE_URL || "";

        if (!r2Bucket) {
          return ApiResponse.internalError(c, "system.r2NotConfigured");
        }

        const processedContent =
          await ContentService.processAndSaveHomepageContent(
            c.env.DB,
            r2Bucket,
            payload,
            publicBaseUrl,
          );

        return ApiResponse.success(
          c,
          processedContent,
          "Homepage content saved successfully",
        );
      },
      "operation.saveHomepageContentFailed",
    );
  }

  // Public API - No authentication required
  static async getPublicHomepageContent(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const content = await ContentService.getPublicHomepageContent(c.env.DB);

        if (!content) {
          return ApiResponse.notFound(c, "content.homepageNotFound");
        }

        return ApiResponse.success(c, content);
      },
      "operation.fetchPublicHomepageContentFailed",
    );
  }
}
