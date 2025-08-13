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
        if (!item) return ApiResponse.notFound(c, "Content block not found");
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
            return ApiResponse.notFound(c, e.message);
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
          if (!deleted)
            return ApiResponse.notFound(c, "Content block not found");
          return ApiResponse.success(c, {});
        } catch (e) {
          if (e instanceof Error && e.message === "Content block not found")
            return ApiResponse.notFound(c, e.message);
          throw e;
        }
      },
      "operation.deleteContentBlockFailed",
    );
  }
}
