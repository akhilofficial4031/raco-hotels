import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { CustomerService } from "../services/customer.service";

import type { AppContext } from "../types";

export class CustomerController {
  /**
   * Create a new customer
   */
  static async create(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        const customer = await CustomerService.createCustomer(
          c.env.DB,
          payload,
        );

        return ApiResponse.created(c, {
          customer,
          message: "customer.created",
        });
      },
      "operation.createCustomerFailed",
    );
  }

  /**
   * Get customer by ID
   */
  static async getById(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const customerId = parseInt(id, 10);

        if (isNaN(customerId)) {
          return ApiResponse.badRequest(c, "customer.invalidId");
        }

        const customer = await CustomerService.getCustomerById(
          c.env.DB,
          customerId,
        );

        if (!customer) {
          return ApiResponse.notFound(c, "customer.notFound");
        }

        return ApiResponse.success(c, {
          customer,
          message: "customer.retrieved",
        });
      },
      "operation.getCustomerFailed",
    );
  }

  /**
   * Get customer by email
   */
  // static async getByEmail(c: AppContext) {
  //   return handleAsyncRoute(
  //     c,
  //     async () => {
  //       const query = c.req.valid("query");
  //       const { email, includeBookingData } = query;

  //       const customer = await CustomerService.getCustomerByEmail(
  //         c.env.DB,
  //         email,
  //         includeBookingData || false,
  //       );

  //       return ApiResponse.success(c, {
  //         customer,
  //         found: !!customer,
  //         message: customer ? "customer.found" : "customer.notFound",
  //       });
  //     },
  //     "operation.findCustomerByEmailFailed",
  //   );
  // }

  /**
   * Update customer
   */
  static async update(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const customerId = parseInt(id, 10);

        if (isNaN(customerId)) {
          return ApiResponse.badRequest(c, "customer.invalidId");
        }

        const payload = await c.req.json();
        const updateData = { ...payload, id: customerId };

        const customer = await CustomerService.updateCustomer(
          c.env.DB,
          updateData,
        );

        return ApiResponse.success(c, {
          customer,
          message: "customer.updated",
        });
      },
      "operation.updateCustomerFailed",
    );
  }

  /**
   * Delete customer (soft delete)
   */
  static async delete(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const customerId = parseInt(id, 10);

        if (isNaN(customerId)) {
          return ApiResponse.badRequest(c, "customer.invalidId");
        }

        await CustomerService.deleteCustomer(c.env.DB, customerId);

        return ApiResponse.success(c, {
          message: "customer.deleted",
        });
      },
      "operation.deleteCustomerFailed",
    );
  }

  /**
   * Search customers with filters
   */
  // static async search(c: AppContext) {
  //   return handleAsyncRoute(
  //     c,
  //     async () => {
  //       const query = c.req.valid("");
  //       const result = await CustomerService.searchCustomers(c.env.DB, query);

  //       return ApiResponse.success(c, {
  //         ...result,
  //         message:
  //           result.customers.length > 0
  //             ? "customer.searchResults"
  //             : "customer.noSearchResults",
  //       });
  //     },
  //     "operation.searchCustomersFailed",
  //   );
  // }

  /**
   * Get customer booking history
   */
  static async getBookingHistory(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const customerId = parseInt(id, 10);

        if (isNaN(customerId)) {
          return ApiResponse.badRequest(c, "customer.invalidId");
        }

        const history = await CustomerService.getCustomerBookingHistory(
          c.env.DB,
          customerId,
        );

        return ApiResponse.success(c, {
          ...history,
          message: "customer.bookingHistoryRetrieved",
        });
      },
      "operation.getCustomerBookingHistoryFailed",
    );
  }

  /**
   * Get customer statistics and insights
   */
  static async getStats(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const { id } = c.req.param();
        const customerId = parseInt(id, 10);

        if (isNaN(customerId)) {
          return ApiResponse.badRequest(c, "customer.invalidId");
        }

        const stats = await CustomerService.getCustomerStats(
          c.env.DB,
          customerId,
        );

        return ApiResponse.success(c, {
          ...stats,
          message: "customer.statsRetrieved",
        });
      },
      "operation.getCustomerStatsFailed",
    );
  }

  /**
   * Find or create customer by email
   * Used during booking process
   */
  static async findOrCreate(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const payload = await c.req.json();
        const result = await CustomerService.findOrCreateCustomer(
          c.env.DB,
          payload,
        );

        return ApiResponse.success(c, {
          customer: result.customer,
          isNew: result.isNew,
          message: result.isNew ? "customer.created" : "customer.found",
        });
      },
      "operation.findOrCreateCustomerFailed",
    );
  }
}
