import { ApiResponse, handleAsyncRoute } from "../lib/responses";
import { PaymentRepository } from "../repositories/payment.repository";

import type { AppContext } from "../types";

export class PaymentController {
  static async listPayments(c: AppContext) {
    return handleAsyncRoute(
      c,
      async () => {
        const query = c.req.query();
        const page = parseInt(query.page || "1", 10);
        const limit = parseInt(query.limit || "10", 10);
        const search = query.search || undefined;
        const status = query.status || undefined;

        const result = await PaymentRepository.listPayments(c.env.DB, {
          page,
          limit,
          search,
          status,
        });

        return ApiResponse.success(c, {
          payments: result.items,
          pagination: result.pagination,
        });
      },
      "operation.fetchPaymentsFailed",
    );
  }
}
