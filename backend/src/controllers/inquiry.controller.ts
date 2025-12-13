import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { InquiryService } from "../services/inquiry.service";

import type { AppContext } from "../types";

export class InquiryController {
  /**
   * Get all inquiries with filters and pagination
   */
  static async getInquiries(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const result = await InquiryService.getInquiries(c.env.DB, query);
        return ApiResponse.success(c, {
          inquiries: result.items,
          pagination: result.pagination,
        });
      },
      "operation.fetchInquiriesFailed",
    );
  }

  /**
   * Get inquiry by ID
   */
  static async getInquiryById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const inquiry = await InquiryService.getInquiryById(c.env.DB, id);
        if (!inquiry) {
          return ApiResponse.notFound(c, "inquiry.notFound");
        }
        return ApiResponse.success(c, { inquiry });
      },
      "operation.fetchInquiryFailed",
    );
  }

  /**
   * Create new inquiry (public endpoint)
   */
  static async createInquiry(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        try {
          const inquiry = await InquiryService.createInquiry(c.env.DB, payload);
          return ApiResponse.created(c, { inquiry });
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Invalid date")
          ) {
            return ApiResponse.badRequest(c, error.message);
          }
          throw error;
        }
      },
      "operation.createInquiryFailed",
    );
  }

  /**
   * Update inquiry
   */
  static async updateInquiry(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const payload = await c.req.json();

        try {
          const inquiry = await InquiryService.updateInquiry(
            c.env.DB,
            id,
            payload,
          );
          if (!inquiry) {
            return ApiResponse.notFound(c, "inquiry.notFound");
          }
          return ApiResponse.success(c, { inquiry });
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Invalid date")
          ) {
            return ApiResponse.badRequest(c, error.message);
          }
          throw error;
        }
      },
      "operation.updateInquiryFailed",
    );
  }

  /**
   * Delete inquiry
   */
  static async deleteInquiry(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const deleted = await InquiryService.deleteInquiry(c.env.DB, id);
        if (!deleted) {
          return ApiResponse.notFound(c, "inquiry.notFound");
        }
        return ApiResponse.success(c, {
          message: "Inquiry deleted successfully",
        });
      },
      "operation.deleteInquiryFailed",
    );
  }

  /**
   * Update inquiry status
   */
  static async updateInquiryStatus(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const id = parseInt(c.req.param("id"), 10);
        const { status } = await c.req.json();

        const inquiry = await InquiryService.updateInquiryStatus(
          c.env.DB,
          id,
          status,
        );
        if (!inquiry) {
          return ApiResponse.notFound(c, "inquiry.notFound");
        }
        return ApiResponse.success(c, { inquiry });
      },
      "operation.updateInquiryStatusFailed",
    );
  }

  /**
   * Get inquiry statistics
   */
  static async getInquiryStats(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const stats = await InquiryService.getInquiryStats(c.env.DB);
        return ApiResponse.success(c, { stats });
      },
      "operation.fetchInquiryStatsFailed",
    );
  }
}
