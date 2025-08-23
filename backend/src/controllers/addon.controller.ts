import { AddonResponse, ApiResponse, handleAsyncRoute } from "../lib/responses";
import { AddonService } from "../services/addon.service";

import type { AppContext } from "../types";

export class AddonController {
  static async getAddons(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const isActive = query.isActive
          ? parseInt(query.isActive, 10)
          : undefined;

        const result = await AddonService.getAddons(c.env.DB, {
          page: String(page),
          limit: String(limit),
          search: query.search,
          category: query.category,
          isActive: isActive !== undefined ? String(isActive) : undefined,
          unitType: query.unitType,
        } as any);

        return AddonResponse.addonsList(c, result.items, result.pagination);
      },
      "operation.fetchAddonsFailed",
    );
  }

  static async getAddonById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await AddonService.getAddonById(c.env.DB, id);
        if (!item) return AddonResponse.addonNotFound(c);
        return AddonResponse.addonRetrieved(c, item);
      },
      "operation.fetchAddonFailed",
    );
  }

  static async createAddon(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();

        try {
          // Validate business rules
          AddonService.validateAddonData(payload);

          // Generate slug if not provided
          if (!payload.slug && payload.name) {
            payload.slug = AddonService.generateSlug(payload.name);
          }

          const created = await AddonService.createAddon(c.env.DB, payload);
          return AddonResponse.addonCreated(c, created);
        } catch (e) {
          if (e instanceof Error && e.message.includes("slug")) {
            return ApiResponse.conflict(c, e.message);
          }
          if (e instanceof Error && e.message.includes("Invalid")) {
            return ApiResponse.badRequest(c, e.message);
          }
          throw e;
        }
      },
      "operation.createAddonFailed",
    );
  }

  static async updateAddon(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();

        try {
          // Generate slug if name is provided but slug is not
          if (payload.name && !payload.slug) {
            payload.slug = AddonService.generateSlug(payload.name);
          }

          const updated = await AddonService.updateAddon(c.env.DB, id, payload);
          return AddonResponse.addonUpdated(c, updated);
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === "Addon not found")
              return AddonResponse.addonNotFound(c);
            if (e.message.includes("slug"))
              return ApiResponse.conflict(c, e.message);
            if (e.message.includes("Invalid"))
              return ApiResponse.badRequest(c, e.message);
          }
          throw e;
        }
      },
      "operation.updateAddonFailed",
    );
  }

  static async deleteAddon(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const deleted = await AddonService.deleteAddon(c.env.DB, id);
          if (!deleted) return AddonResponse.addonNotFound(c);
          return AddonResponse.addonDeleted(c);
        } catch (e) {
          if (e instanceof Error && e.message === "Addon not found") {
            return AddonResponse.addonNotFound(c);
          }
          throw e;
        }
      },
      "operation.deleteAddonFailed",
    );
  }

  static async toggleAddonStatus(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        try {
          const updated = await AddonService.toggleAddonStatus(c.env.DB, id);
          return AddonResponse.addonUpdated(c, updated);
        } catch (e) {
          if (e instanceof Error && e.message === "Addon not found") {
            return AddonResponse.addonNotFound(c);
          }
          throw e;
        }
      },
      "operation.toggleAddonStatusFailed",
    );
  }

  static async getAddonsByCategory(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const category = c.req.param("category");
        const addons = await AddonService.getAddonsByCategory(
          c.env.DB,
          category,
        );
        return AddonResponse.addonsList(c, addons);
      },
      "operation.fetchAddonsByCategoryFailed",
    );
  }

  static async getActiveAddons(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const addons = await AddonService.getActiveAddons(c.env.DB);
        return AddonResponse.addonsList(c, addons);
      },
      "operation.fetchActiveAddonsFailed",
    );
  }
}
