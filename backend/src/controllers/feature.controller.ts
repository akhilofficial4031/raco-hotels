import { FeatureResponse, handleAsyncRoute } from "../lib/responses";
import { FeatureService } from "../services/feature.service";

import type { AppContext } from "../types";

export class FeatureController {
  static async getFeatures(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const isVisible = query.isVisible
          ? query.isVisible === "true"
          : undefined;
        const result = await FeatureService.getFeatures(c.env.DB, {
          page: String(page),
          limit: String(limit),
          search: query.search,
          isVisible: isVisible !== undefined ? isVisible : undefined,
        } as any);
        return FeatureResponse.featuresList(c, result.items, result.pagination);
      },
      "operation.fetchFeaturesFailed",
    );
  }

  static async getFeatureById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const item = await FeatureService.getFeatureById(c.env.DB, id);
        if (!item) return FeatureResponse.featureNotFound(c);
        return FeatureResponse.featureRetrieved(c, item);
      },
      "operation.fetchFeatureFailed",
    );
  }

  static async createFeature(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        const created = await FeatureService.createFeature(c.env.DB, payload);
        return FeatureResponse.featureCreated(c, created);
      },
      "operation.createFeatureFailed",
    );
  }

  static async updateFeature(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();
        const updated = await FeatureService.updateFeature(
          c.env.DB,
          id,
          payload,
        );
        return FeatureResponse.featureUpdated(c, updated);
      },
      "operation.updateFeatureFailed",
    );
  }
  static async deleteFeature(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const deleted = await FeatureService.deleteFeature(c.env.DB, id);
        if (!deleted) return FeatureResponse.featureNotFound(c);
        return FeatureResponse.featureDeleted(c);
      },
      "operation.deleteFeatureFailed",
    );
  }
}
