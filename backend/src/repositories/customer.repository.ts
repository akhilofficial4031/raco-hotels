import {
  and,
  desc,
  eq,
  like,
  or,
  sql,
  count,
  isNull,
  isNotNull,
} from "drizzle-orm";

import {
  customer as customerTable,
  booking as bookingTable,
  hotel as hotelTable,
} from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  CreateCustomerData,
  UpdateCustomerData,
  CustomerSearchFilters,
  DatabaseCustomer,
  CustomerWithBookingStats,
  CustomerBookingHistory,
} from "../types";

export class CustomerRepository {
  /**
   * Create a new customer
   */
  static async create(
    db: D1Database,
    data: CreateCustomerData,
  ): Promise<DatabaseCustomer> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();

    // Convert arrays to JSON strings
    const dietaryPreferences = data.dietaryPreferences
      ? JSON.stringify(data.dietaryPreferences)
      : null;
    const specialRequests = data.specialRequests
      ? JSON.stringify(data.specialRequests)
      : null;
    const marketingOptIn = data.marketingOptIn ? 1 : 0;
    const hasUserAccount = data.hasUserAccount ? 1 : 0;

    const [created] = await database
      .insert(customerTable)
      .values({
        email: data.email,
        fullName: data.fullName,
        phone: data.phone || null,
        alternatePhone: data.alternatePhone || null,
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender || null,
        nationality: data.nationality || null,
        idType: data.idType || null,
        idNumber: data.idNumber || null,
        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
        postalCode: data.postalCode || null,
        dietaryPreferences,
        specialRequests,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        loyaltyNumber: data.loyaltyNumber || null,
        marketingOptIn,
        firstBookingSource: data.firstBookingSource || "web",
        status: data.status || "active",
        notes: data.notes || null,
        hasUserAccount,
        preferredPaymentMethod: data.preferredPaymentMethod || null,
        vipStatus: data.vipStatus || "regular",
        preferredContactMethod: data.preferredContactMethod || "email",
        languagePreference: data.languagePreference || "en",
        timeZone: data.timeZone || null,
        createdAt: nowIso,
        updatedAt: nowIso,
      })
      .returning();

    return this.transformDatabaseCustomer(created);
  }

  /**
   * Find customer by ID
   */
  static async findById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseCustomer | null> {
    const database = getDb(db);
    const [customer] = await database
      .select()
      .from(customerTable)
      .where(eq(customerTable.id, id))
      .limit(1);

    return customer ? this.transformDatabaseCustomer(customer as any) : null;
  }

  /**
   * Find customer by email
   */
  static async findByEmail(
    db: D1Database,
    email: string,
  ): Promise<DatabaseCustomer | null> {
    const database = getDb(db);
    const [customer] = await database
      .select()
      .from(customerTable)
      .where(eq(customerTable.email, email))
      .limit(1);

    return customer ? this.transformDatabaseCustomer(customer as any) : null;
  }

  /**
   * Update customer
   */
  static async update(
    db: D1Database,
    data: UpdateCustomerData,
  ): Promise<DatabaseCustomer | null> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();

    // Prepare update data
    const updateData: any = {
      updatedAt: nowIso,
    };

    if (data.email !== undefined) updateData.email = data.email;
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.alternatePhone !== undefined)
      updateData.alternatePhone = data.alternatePhone || null;
    if (data.dateOfBirth !== undefined)
      updateData.dateOfBirth = data.dateOfBirth || null;
    if (data.gender !== undefined) updateData.gender = data.gender || null;
    if (data.nationality !== undefined)
      updateData.nationality = data.nationality || null;
    if (data.idType !== undefined) updateData.idType = data.idType || null;
    if (data.idNumber !== undefined)
      updateData.idNumber = data.idNumber || null;
    if (data.addressLine1 !== undefined)
      updateData.addressLine1 = data.addressLine1 || null;
    if (data.addressLine2 !== undefined)
      updateData.addressLine2 = data.addressLine2 || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.state !== undefined) updateData.state = data.state || null;
    if (data.country !== undefined) updateData.country = data.country || null;
    if (data.postalCode !== undefined)
      updateData.postalCode = data.postalCode || null;
    if (data.dietaryPreferences !== undefined) {
      updateData.dietaryPreferences = data.dietaryPreferences
        ? JSON.stringify(data.dietaryPreferences)
        : null;
    }
    if (data.specialRequests !== undefined) {
      updateData.specialRequests = data.specialRequests
        ? JSON.stringify(data.specialRequests)
        : null;
    }
    if (data.emergencyContactName !== undefined)
      updateData.emergencyContactName = data.emergencyContactName || null;
    if (data.emergencyContactPhone !== undefined)
      updateData.emergencyContactPhone = data.emergencyContactPhone || null;
    if (data.loyaltyNumber !== undefined)
      updateData.loyaltyNumber = data.loyaltyNumber || null;
    if (data.marketingOptIn !== undefined)
      updateData.marketingOptIn = data.marketingOptIn ? 1 : 0;
    if (data.firstBookingSource !== undefined)
      updateData.firstBookingSource = data.firstBookingSource;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.hasUserAccount !== undefined)
      updateData.hasUserAccount = data.hasUserAccount ? 1 : 0;
    if (data.preferredPaymentMethod !== undefined)
      updateData.preferredPaymentMethod = data.preferredPaymentMethod || null;
    if (data.vipStatus !== undefined)
      updateData.vipStatus = data.vipStatus || null;
    if (data.preferredContactMethod !== undefined)
      updateData.preferredContactMethod = data.preferredContactMethod || null;
    if (data.languagePreference !== undefined)
      updateData.languagePreference = data.languagePreference || null;
    if (data.timeZone !== undefined)
      updateData.timeZone = data.timeZone || null;

    const [updated] = await database
      .update(customerTable)
      .set(updateData)
      .where(eq(customerTable.id, data.id))
      .returning();

    return updated ? this.transformDatabaseCustomer(updated as any) : null;
  }

  /**
   * Delete customer (soft delete by setting status to inactive)
   */
  static async delete(db: D1Database, id: number): Promise<boolean> {
    const database = getDb(db);
    const nowIso = new Date().toISOString();

    const result = await database
      .update(customerTable)
      .set({
        status: "inactive" as any,
        updatedAt: nowIso,
      })
      .where(eq(customerTable.id, id));

    return result.meta.changes > 0;
  }

  /**
   * Search customers with filters and pagination
   */
  static async search(db: D1Database, filters: CustomerSearchFilters) {
    const database = getDb(db);
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100); // Cap at 100
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: any[] = [];

    if (filters.email) {
      conditions.push(like(customerTable.email, `%${filters.email}%`));
    }

    if (filters.fullName) {
      conditions.push(like(customerTable.fullName, `%${filters.fullName}%`));
    }

    if (filters.phone) {
      conditions.push(
        or(
          like(customerTable.phone, `%${filters.phone}%`),
          like(customerTable.alternatePhone, `%${filters.phone}%`),
        ),
      );
    }

    if (filters.status) {
      conditions.push(eq(customerTable.status, filters.status));
    }

    if (filters.firstBookingSource) {
      conditions.push(
        eq(customerTable.firstBookingSource, filters.firstBookingSource),
      );
    }

    if (filters.vipStatus) {
      conditions.push(eq(customerTable.vipStatus, filters.vipStatus));
    }

    if (filters.createdAfter) {
      conditions.push(
        sql`${customerTable.createdAt} >= ${filters.createdAfter}`,
      );
    }

    if (filters.createdBefore) {
      conditions.push(
        sql`${customerTable.createdAt} <= ${filters.createdBefore}`,
      );
    }

    if (filters.hasBookings !== undefined) {
      if (filters.hasBookings) {
        conditions.push(isNotNull(customerTable.lastBookingAt));
      } else {
        conditions.push(isNull(customerTable.lastBookingAt));
      }
    }

    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Build order by
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";
    const orderBy =
      sortOrder === "desc"
        ? desc(customerTable[sortBy])
        : customerTable[sortBy];

    // Get total count
    const [totalResult] = await database
      .select({ count: count() })
      .from(customerTable)
      .where(whereCondition);

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    // Get customers with booking stats
    const customers = await database
      .select({
        id: customerTable.id,
        email: customerTable.email,
        fullName: customerTable.fullName,
        phone: customerTable.phone,
        alternatePhone: customerTable.alternatePhone,
        dateOfBirth: customerTable.dateOfBirth,
        gender: customerTable.gender,
        nationality: customerTable.nationality,
        idType: customerTable.idType,
        idNumber: customerTable.idNumber,
        addressLine1: customerTable.addressLine1,
        addressLine2: customerTable.addressLine2,
        city: customerTable.city,
        state: customerTable.state,
        country: customerTable.country,
        postalCode: customerTable.postalCode,
        dietaryPreferences: customerTable.dietaryPreferences,
        specialRequests: customerTable.specialRequests,
        emergencyContactName: customerTable.emergencyContactName,
        emergencyContactPhone: customerTable.emergencyContactPhone,
        loyaltyNumber: customerTable.loyaltyNumber,
        marketingOptIn: customerTable.marketingOptIn,
        firstBookingSource: customerTable.firstBookingSource,
        status: customerTable.status,
        notes: customerTable.notes,
        hasUserAccount: customerTable.hasUserAccount,
        preferredPaymentMethod: customerTable.preferredPaymentMethod,
        vipStatus: customerTable.vipStatus,
        preferredContactMethod: customerTable.preferredContactMethod,
        languagePreference: customerTable.languagePreference,
        timeZone: customerTable.timeZone,
        createdAt: customerTable.createdAt,
        updatedAt: customerTable.updatedAt,
        lastBookingAt: customerTable.lastBookingAt,
        totalBookings: sql<number>`COALESCE((
          SELECT COUNT(*) 
          FROM ${bookingTable} 
          WHERE ${bookingTable.customerId} = ${customerTable.id}
        ), 0)`.as("totalBookings"),
        totalSpentCents: sql<number>`COALESCE((
          SELECT SUM(${bookingTable.totalAmountCents}) 
          FROM ${bookingTable} 
          WHERE ${bookingTable.customerId} = ${customerTable.id} 
          AND ${bookingTable.status} NOT IN ('cancelled', 'refunded')
        ), 0)`.as("totalSpentCents"),
        calculatedLastBookingAt: sql<string>`(
          SELECT MAX(${bookingTable.createdAt}) 
          FROM ${bookingTable} 
          WHERE ${bookingTable.customerId} = ${customerTable.id}
        )`.as("calculatedLastBookingAt"),
      })
      .from(customerTable)
      .where(whereCondition)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      customers: customers.map((c) =>
        this.transformCustomerWithStats(c as any),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get customer booking history
   */
  static async getBookingHistory(
    db: D1Database,
    customerId: number,
  ): Promise<CustomerBookingHistory | null> {
    const database = getDb(db);

    // First check if customer exists
    const customer = await this.findById(db, customerId);
    if (!customer) return null;

    // Get booking history
    const bookings = await database
      .select({
        id: bookingTable.id,
        referenceCode: bookingTable.referenceCode,
        hotelName: hotelTable.name,
        checkInDate: bookingTable.checkInDate,
        checkOutDate: bookingTable.checkOutDate,
        status: bookingTable.status,
        totalAmountCents: bookingTable.totalAmountCents,
        currencyCode: bookingTable.currencyCode,
        createdAt: bookingTable.createdAt,
      })
      .from(bookingTable)
      .innerJoin(hotelTable, eq(bookingTable.hotelId, hotelTable.id))
      .where(eq(bookingTable.customerId, customerId))
      .orderBy(desc(bookingTable.createdAt));

    const totalSpentCents = bookings
      .filter((b) => !["cancelled", "refunded"].includes(b.status))
      .reduce((sum, b) => sum + b.totalAmountCents, 0);

    return {
      customerId,
      bookings,
      totalBookings: bookings.length,
      totalSpentCents,
    };
  }

  /**
   * Update customer's last booking timestamp
   */
  static async updateLastBookingAt(
    db: D1Database,
    customerId: number,
    timestamp?: string,
  ): Promise<void> {
    const database = getDb(db);
    const lastBookingAt = timestamp || new Date().toISOString();

    await database
      .update(customerTable)
      .set({
        lastBookingAt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(customerTable.id, customerId));
  }

  /**
   * Transform database customer to interface
   */
  private static transformDatabaseCustomer(dbCustomer: any): DatabaseCustomer {
    return {
      id: dbCustomer.id,
      email: dbCustomer.email,
      fullName: dbCustomer.fullName,
      phone: dbCustomer.phone,
      alternatePhone: dbCustomer.alternatePhone,
      dateOfBirth: dbCustomer.dateOfBirth,
      gender: dbCustomer.gender,
      nationality: dbCustomer.nationality,
      idType: dbCustomer.idType,
      idNumber: dbCustomer.idNumber,
      addressLine1: dbCustomer.addressLine1,
      addressLine2: dbCustomer.addressLine2,
      city: dbCustomer.city,
      state: dbCustomer.state,
      country: dbCustomer.country,
      postalCode: dbCustomer.postalCode,
      dietaryPreferences: dbCustomer.dietaryPreferences,
      specialRequests: dbCustomer.specialRequests,
      emergencyContactName: dbCustomer.emergencyContactName,
      emergencyContactPhone: dbCustomer.emergencyContactPhone,
      loyaltyNumber: dbCustomer.loyaltyNumber,
      marketingOptIn: dbCustomer.marketingOptIn,
      firstBookingSource: dbCustomer.firstBookingSource,
      status: dbCustomer.status,
      notes: dbCustomer.notes,
      hasUserAccount: dbCustomer.hasUserAccount,
      preferredPaymentMethod: dbCustomer.preferredPaymentMethod,
      vipStatus: dbCustomer.vipStatus,
      preferredContactMethod: dbCustomer.preferredContactMethod,
      languagePreference: dbCustomer.languagePreference,
      timeZone: dbCustomer.timeZone,
      createdAt: dbCustomer.createdAt,
      updatedAt: dbCustomer.updatedAt,
      lastBookingAt: dbCustomer.lastBookingAt,
      lastContactAt: dbCustomer.lastContactAt,
    };
  }

  /**
   * Transform database customer with stats to interface
   */
  private static transformCustomerWithStats(
    dbCustomer: any,
  ): CustomerWithBookingStats {
    const base = this.transformDatabaseCustomer(dbCustomer);
    return {
      ...base,
      totalBookings: dbCustomer.totalBookings || 0,
      totalSpentCents: dbCustomer.totalSpentCents || 0,
      lastBookingAt: dbCustomer.calculatedLastBookingAt,
    };
  }
}
