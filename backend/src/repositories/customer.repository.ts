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
  bookingItems as bookingItemsTable,
  roomType as roomTypeTable,
  room as roomTable,
  payment as paymentTable,
  promoCode as promoCodeTable,
  bookingPromotion as bookingPromotionTable,
  user as userTable,
} from "../../drizzle/schema";
import { getDb } from "../db";

import type {
  CreateCustomerData,
  UpdateCustomerData,
  CustomerSearchFilters,
  DatabaseCustomer,
  CustomerWithBookingStats,
  CustomerBookingHistory,
  CustomerDetailsResponse,
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

  static async findAll(db: D1Database): Promise<DatabaseCustomer[]> {
    const database = getDb(db);
    const customers = await database.select().from(customerTable);
    return customers.map((c) => this.transformDatabaseCustomer(c as any));
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
   * Find customer by phone
   */
  static async findByPhone(
    db: D1Database,
    phone: string,
  ): Promise<DatabaseCustomer | null> {
    const database = getDb(db);
    const [customer] = await database
      .select()
      .from(customerTable)
      .where(
        or(
          eq(customerTable.phone, phone),
          eq(customerTable.alternatePhone, phone),
        ),
      )
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

  /**
   * Get comprehensive customer details
   */
  static async getCustomerDetails(
    db: D1Database,
    customerId: number,
  ): Promise<CustomerDetailsResponse | null> {
    const database = getDb(db);

    // Check if customer exists
    const customer = await this.findById(db, customerId);
    if (!customer) return null;

    // Get customer with booking stats
    const [customerWithStats] = await database
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
        preferredPaymentMethod: customerTable.preferredPaymentMethod,
        vipStatus: customerTable.vipStatus,
        preferredContactMethod: customerTable.preferredContactMethod,
        languagePreference: customerTable.languagePreference,
        timeZone: customerTable.timeZone,
        createdAt: customerTable.createdAt,
        updatedAt: customerTable.updatedAt,
        lastBookingAt: customerTable.lastBookingAt,
        totalBookings: sql<number>`COALESCE((
          SELECT COUNT(*) FROM ${bookingTable}
          WHERE ${bookingTable.customerId} = ${customerTable.id}
        ), 0)`.as("totalBookings"),
        totalSpentCents: sql<number>`COALESCE((
          SELECT SUM(${bookingTable.totalAmountCents})
          FROM ${bookingTable}
          WHERE ${bookingTable.customerId} = ${customerTable.id}
          AND ${bookingTable.status} NOT IN ('cancelled', 'refunded')
        ), 0)`.as("totalSpentCents"),
        hasUserAccount: sql<boolean>`EXISTS(
          SELECT 1 FROM ${userTable}
          WHERE ${userTable.email} = ${customerTable.email}
        )`.as("hasUserAccount"),
      })
      .from(customerTable)
      .where(eq(customerTable.id, customerId))
      .limit(1);

    if (!customerWithStats) return null;

    // Get current active booking
    const [currentBooking] = await database
      .select({
        id: bookingTable.id,
        referenceCode: bookingTable.referenceCode,
        hotelName: hotelTable.name,
        roomNumber: roomTable.roomNumber,
        floor: roomTable.floor,
        checkInDate: bookingTable.checkInDate,
        checkOutDate: bookingTable.checkOutDate,
        status: bookingTable.status,
      })
      .from(bookingTable)
      .innerJoin(hotelTable, eq(bookingTable.hotelId, hotelTable.id))
      .innerJoin(
        bookingItemsTable,
        eq(bookingTable.id, bookingItemsTable.bookingId),
      )
      .innerJoin(roomTable, eq(bookingItemsTable.roomId, roomTable.id))
      .where(
        and(
          eq(bookingTable.customerId, customerId),
          eq(bookingTable.status, "checkedin"),
        ),
      )
      .limit(1);

    // Get all bookings for history
    const allBookings = await database
      .select({
        id: bookingTable.id,
        referenceCode: bookingTable.referenceCode,
        hotelId: hotelTable.id,
        hotelName: hotelTable.name,
        status: bookingTable.status,
        checkInDate: bookingTable.checkInDate,
        checkOutDate: bookingTable.checkOutDate,
        totalAmountCents: bookingTable.totalAmountCents,
        currencyCode: bookingTable.currencyCode,
        createdAt: bookingTable.createdAt,
        numAdults: bookingTable.numAdults,
        numChildren: bookingTable.numChildren,
      })
      .from(bookingTable)
      .innerJoin(hotelTable, eq(bookingTable.hotelId, hotelTable.id))
      .where(eq(bookingTable.customerId, customerId))
      .orderBy(desc(bookingTable.createdAt));

    // Get booking items for all bookings
    const bookingIds = allBookings.map((b) => b.id);
    const bookingItems =
      bookingIds.length > 0
        ? await database
            .select({
              bookingId: bookingItemsTable.bookingId,
              roomTypeName: roomTypeTable.name,
              roomNumber: roomTable.roomNumber,
            })
            .from(bookingItemsTable)
            .innerJoin(
              roomTypeTable,
              eq(bookingItemsTable.roomTypeId, roomTypeTable.id),
            )
            .innerJoin(roomTable, eq(bookingItemsTable.roomId, roomTable.id))
            .where(
              sql`${bookingItemsTable.bookingId} IN (${bookingIds.join(",")})`,
            )
        : [];

    // Get payments for all bookings
    const payments =
      bookingIds.length > 0
        ? await database
            .select({
              bookingId: paymentTable.bookingId,
              amountCents: paymentTable.amountCents,
              status: paymentTable.status,
              method: paymentTable.method,
              processor: paymentTable.processor,
              createdAt: paymentTable.createdAt,
            })
            .from(paymentTable)
            .where(sql`${paymentTable.bookingId} IN (${bookingIds.join(",")})`)
        : [];

    // Get promo usage
    const promoUsage = await database
      .select({
        bookingId: bookingPromotionTable.bookingId,
        promoCodeId: bookingPromotionTable.promoCodeId,
        promoCode: promoCodeTable.code,
        promoType: promoCodeTable.type,
        promoValue: promoCodeTable.value,
        bookingReference: bookingTable.referenceCode,
        bookingTotalCents: bookingTable.totalAmountCents,
        bookingCurrency: bookingTable.currencyCode,
        amountCents: bookingPromotionTable.amountCents,
        usedAt: bookingPromotionTable.createdAt,
      })
      .from(bookingPromotionTable)
      .innerJoin(
        promoCodeTable,
        eq(bookingPromotionTable.promoCodeId, promoCodeTable.id),
      )
      .innerJoin(
        bookingTable,
        eq(bookingPromotionTable.bookingId, bookingTable.id),
      )
      .where(eq(bookingTable.customerId, customerId))
      .orderBy(desc(bookingPromotionTable.createdAt));

    // Get payment history
    const paymentHistory = await database
      .select({
        id: paymentTable.id,
        bookingReference: bookingTable.referenceCode,
        amountCents: paymentTable.amountCents,
        currencyCode: paymentTable.currencyCode,
        status: paymentTable.status,
        method: paymentTable.method,
        processor: paymentTable.processor,
        createdAt: paymentTable.createdAt,
      })
      .from(paymentTable)
      .innerJoin(bookingTable, eq(paymentTable.bookingId, bookingTable.id))
      .where(eq(bookingTable.customerId, customerId))
      .orderBy(desc(paymentTable.createdAt));

    // Categorize bookings
    const now = new Date();
    const past: any[] = [];
    const active: any[] = [];
    const future: any[] = [];

    allBookings.forEach((booking) => {
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);

      // Get booking items for this booking
      const items = bookingItems
        .filter((item) => item.bookingId === booking.id)
        .map((item) => ({
          room_type: { name: item.roomTypeName },
          room: { roomNumber: item.roomNumber },
        }));

      // Get payments for this booking
      const bookingPayments = payments
        .filter((payment) => payment.bookingId === booking.id)
        .map((payment) => ({
          amountCents: payment.amountCents,
          status: payment.status,
          method: payment.method,
          createdAt: payment.createdAt,
        }));

      const bookingWithDetails = {
        id: booking.id,
        referenceCode: booking.referenceCode,
        hotel: { id: booking.hotelId, name: booking.hotelName },
        status: booking.status,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalAmountCents: booking.totalAmountCents,
        currencyCode: booking.currencyCode,
        createdAt: booking.createdAt,
        numAdults: booking.numAdults,
        numChildren: booking.numChildren,
        items,
        payments: bookingPayments,
      };

      if (booking.status === "checkedout" || checkOutDate < now) {
        past.push(bookingWithDetails);
      } else if (booking.status === "checkedin") {
        active.push(bookingWithDetails);
      } else if (checkInDate > now) {
        future.push(bookingWithDetails);
      } else {
        active.push(bookingWithDetails); // Currently staying
      }
    });

    // Calculate spending analytics
    const completedBookings = allBookings.filter(
      (b) =>
        ["checkedout", "completed"].includes(b.status) &&
        new Date(b.checkOutDate) < now,
    );

    const totalSpent = completedBookings.reduce(
      (sum, b) => sum + b.totalAmountCents,
      0,
    );
    const averageBookingValue =
      completedBookings.length > 0
        ? Math.round(totalSpent / completedBookings.length)
        : 0;
    const lastBookingAmount = completedBookings[0]?.totalAmountCents || 0;

    // Most visited hotel
    const hotelVisits = completedBookings.reduce(
      (acc, booking) => {
        acc[booking.hotelName] = (acc[booking.hotelName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const mostVisitedHotel =
      Object.entries(hotelVisits).length > 0
        ? Object.entries(hotelVisits).reduce((a, b) => (a[1] > b[1] ? a : b))
        : ["", 0];

    // Spending by hotel
    const spendingByHotel = completedBookings.reduce(
      (acc, booking) => {
        const existing = acc.find((h) => h.hotelName === booking.hotelName);
        if (existing) {
          existing.totalSpentCents += booking.totalAmountCents;
          existing.bookingCount += 1;
        } else {
          acc.push({
            hotelName: booking.hotelName,
            totalSpentCents: booking.totalAmountCents,
            bookingCount: 1,
          });
        }
        return acc;
      },
      [] as Array<{
        hotelName: string;
        totalSpentCents: number;
        bookingCount: number;
      }>,
    );

    // Monthly spending
    const monthlySpending = completedBookings
      .reduce(
        (acc, booking) => {
          const month = booking.createdAt.substring(0, 7); // YYYY-MM format
          const existing = acc.find((m) => m.month === month);
          if (existing) {
            existing.amountCents += booking.totalAmountCents;
          } else {
            acc.push({ month, amountCents: booking.totalAmountCents });
          }
          return acc;
        },
        [] as Array<{ month: string; amountCents: number }>,
      )
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12); // Last 12 months

    return {
      customer: {
        id: customerWithStats.id,
        email: customerWithStats.email,
        fullName: customerWithStats.fullName,
        phone: customerWithStats.phone,
        alternatePhone: customerWithStats.alternatePhone,
        dateOfBirth: customerWithStats.dateOfBirth,
        gender: customerWithStats.gender as "male" | "female" | "other" | null,
        nationality: customerWithStats.nationality,
        idType: customerWithStats.idType,
        idNumber: customerWithStats.idNumber,
        addressLine1: customerWithStats.addressLine1,
        addressLine2: customerWithStats.addressLine2,
        city: customerWithStats.city,
        state: customerWithStats.state,
        country: customerWithStats.country,
        postalCode: customerWithStats.postalCode,
        dietaryPreferences: customerWithStats.dietaryPreferences
          ? JSON.parse(customerWithStats.dietaryPreferences)
          : null,
        specialRequests: customerWithStats.specialRequests
          ? JSON.parse(customerWithStats.specialRequests)
          : null,
        emergencyContactName: customerWithStats.emergencyContactName,
        emergencyContactPhone: customerWithStats.emergencyContactPhone,
        loyaltyNumber: customerWithStats.loyaltyNumber,
        marketingOptIn: !!customerWithStats.marketingOptIn,
        firstBookingSource: customerWithStats.firstBookingSource as
          | "web"
          | "front_office"
          | "phone"
          | "email"
          | "mobile_app"
          | "walk_in",
        status: customerWithStats.status as "active" | "inactive" | "blocked",
        notes: customerWithStats.notes,
        preferredPaymentMethod: customerWithStats.preferredPaymentMethod,
        vipStatus: customerWithStats.vipStatus as
          | "regular"
          | "silver"
          | "gold"
          | "platinum"
          | null,
        preferredContactMethod: customerWithStats.preferredContactMethod as
          | "email"
          | "phone"
          | "sms"
          | null,
        languagePreference: customerWithStats.languagePreference || "en",
        timeZone: customerWithStats.timeZone,
        createdAt: customerWithStats.createdAt,
        updatedAt: customerWithStats.updatedAt,
        lastBookingAt: customerWithStats.lastBookingAt,
        totalBookings: customerWithStats.totalBookings,
        totalSpentCents: customerWithStats.totalSpentCents,
        hasUserAccount: customerWithStats.hasUserAccount,
      },
      currentBooking: currentBooking
        ? {
            id: currentBooking.id,
            referenceCode: currentBooking.referenceCode,
            hotel: { name: currentBooking.hotelName },
            room: {
              roomNumber: currentBooking.roomNumber,
              floor: currentBooking.floor?.toString(),
            },
            checkInDate: currentBooking.checkInDate,
            checkOutDate: currentBooking.checkOutDate,
            status: currentBooking.status,
          }
        : undefined,
      bookingHistory: {
        past,
        active,
        future,
      },
      promoUsage: promoUsage.map((p) => ({
        id: `${p.bookingId}-${p.promoCodeId}`,
        promoCode: {
          code: p.promoCode,
          type: p.promoType,
          value: p.promoValue,
        },
        booking: {
          referenceCode: p.bookingReference,
          totalAmountCents: p.bookingTotalCents,
          currencyCode: p.bookingCurrency,
        },
        amountCents: p.amountCents,
        usedAt: p.usedAt,
      })),
      spendingAnalytics: {
        totalSpentCents: totalSpent,
        averageBookingValueCents: averageBookingValue,
        lastBookingAmountCents: lastBookingAmount,
        mostVisitedHotel: {
          name: mostVisitedHotel[0] as string,
          visits: mostVisitedHotel[1] as number,
        },
        spendingByHotel,
        monthlySpending,
      },
      paymentHistory,
    };
  }
}
