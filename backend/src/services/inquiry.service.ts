import { InquiryRepository } from "../repositories/inquiry.repository";

import type {
  CreateInquiryData,
  UpdateInquiryData,
  InquiryQueryParams,
  InquiryListResult,
  DatabaseInquiry,
} from "../types";

export class InquiryService {
  /**
   * Get inquiries with filtering and pagination
   */
  static async getInquiries(
    db: D1Database,
    params: InquiryQueryParams,
  ): Promise<InquiryListResult> {
    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 10;

    const filters = {
      status: params.status || undefined,
      search: params.search || undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
    };

    const { inquiries, total } = await InquiryRepository.findAll(db, filters, {
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get inquiry by ID
   */
  static async getInquiryById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseInquiry | null> {
    return InquiryRepository.findById(db, id);
  }

  /**
   * Create new inquiry
   */
  static async createInquiry(
    db: D1Database,
    data: CreateInquiryData,
  ): Promise<DatabaseInquiry> {
    // Validate date format
    if (data.date && !this.isValidDate(data.date)) {
      throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
    }

    // Handle attraction slug to ID conversion
    let attractionId: number | null = null;
    if (data.attractionSlug) {
      const attraction = await InquiryRepository.findAttractionBySlug(
        db,
        data.attractionSlug,
      );
      if (attraction) {
        attractionId = attraction.id;
      } else {
        throw new Error(`Attraction with slug "${data.attractionSlug}" not found`);
      }
    }

    const createData = {
      ...data,
      attractionId,
    };

    return InquiryRepository.create(db, createData as any);
  }

  /**
   * Update inquiry
   */
  static async updateInquiry(
    db: D1Database,
    id: number,
    data: UpdateInquiryData,
  ): Promise<DatabaseInquiry | null> {
    // Check if inquiry exists
    const existingInquiry = await InquiryRepository.findById(db, id);
    if (!existingInquiry) {
      return null;
    }

    // Validate date format if provided
    if (data.date && !this.isValidDate(data.date)) {
      throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
    }

    // Handle attraction slug to ID conversion
    let attractionId: number | null | undefined = undefined;
    if (data.attractionSlug !== undefined) {
      if (data.attractionSlug === "" || data.attractionSlug === null) {
        attractionId = null; // Clear the attraction
      } else {
        const attraction = await InquiryRepository.findAttractionBySlug(
          db,
          data.attractionSlug,
        );
        if (attraction) {
          attractionId = attraction.id;
        } else {
          throw new Error(`Attraction with slug "${data.attractionSlug}" not found`);
        }
      }
    }

    const updateData = {
      ...data,
      ...(attractionId !== undefined ? { attractionId } : {}),
    };

    return InquiryRepository.update(db, id, updateData as any);
  }

  /**
   * Delete inquiry
   */
  static async deleteInquiry(db: D1Database, id: number): Promise<boolean> {
    // Check if inquiry exists
    const existingInquiry = await InquiryRepository.findById(db, id);
    if (!existingInquiry) {
      return false;
    }

    return InquiryRepository.delete(db, id);
  }

  /**
   * Get inquiry statistics
   */
  static async getInquiryStats(
    db: D1Database,
  ): Promise<Record<string, number>> {
    return InquiryRepository.getStats(db);
  }

  /**
   * Update inquiry status
   */
  static async updateInquiryStatus(
    db: D1Database,
    id: number,
    status: "pending" | "addressed" | "confirmed",
  ): Promise<DatabaseInquiry | null> {
    return this.updateInquiry(db, id, { status });
  }

  /**
   * Search inquiries by term (name, phone, or message)
   */
  static async searchInquiries(
    db: D1Database,
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<InquiryListResult> {
    return this.getInquiries(db, {
      page: page.toString(),
      limit: limit.toString(),
      search: searchTerm,
    });
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private static isValidDate(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    const date = new Date(dateString);
    const [year, month, day] = dateString.split("-").map(Number);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }
}
