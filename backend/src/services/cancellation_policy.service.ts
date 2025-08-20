import { CancellationPolicyRepository } from "../repositories/cancellation_policy.repository";
import {
  type CreateCancellationPolicyRequestSchema,
  type UpdateCancellationPolicyRequestSchema,
  type CancellationPolicyQueryParamsSchema,
} from "../schemas";

import type { z } from "zod";

export class CancellationPolicyService {
  static async createPolicy(
    db: D1Database,
    data: z.infer<typeof CreateCancellationPolicyRequestSchema>,
  ) {
    return await CancellationPolicyRepository.create(db, {
      ...data,
      description: data.description ?? null,
      freeCancelUntilHours:
        data.freeCancelUntilHours !== undefined
          ? data.freeCancelUntilHours
          : null,
      penaltyType: data.penaltyType ?? null,
      penaltyValue: data.penaltyValue ?? null,
    });
  }

  static async updatePolicy(
    db: D1Database,
    id: number,
    data: z.infer<typeof UpdateCancellationPolicyRequestSchema>,
  ) {
    const existing = await CancellationPolicyRepository.findById(db, id);
    if (!existing) {
      throw new Error("Cancellation policy not found");
    }
    const updated = await CancellationPolicyRepository.update(db, id, {
      ...data,
      penaltyType: data.penaltyType ?? null,
    });
    if (!updated) {
      throw new Error("Cancellation policy not found");
    }
    return updated;
  }

  static async getPolicyById(db: D1Database, id: number) {
    return await CancellationPolicyRepository.findById(db, id);
  }

  static async getPolicies(
    db: D1Database,
    query: z.infer<typeof CancellationPolicyQueryParamsSchema>,
  ) {
    const { page = 1, limit = 10, hotelId } = query;
    const { policies, total } = await CancellationPolicyRepository.findAll(
      db,
      { hotelId },
      { page, limit },
    );
    const totalPages = Math.ceil(total / limit);
    return {
      items: policies,
      pagination: { page, limit, total, totalPages },
    };
  }

  static async deletePolicy(db: D1Database, id: number) {
    const existing = await CancellationPolicyRepository.findById(db, id);
    if (!existing) {
      throw new Error("Cancellation policy not found");
    }
    return await CancellationPolicyRepository.delete(db, id);
  }
}
