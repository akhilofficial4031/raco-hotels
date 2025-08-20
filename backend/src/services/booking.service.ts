import { and, between, eq, sql } from "drizzle-orm";

import {
  booking as bookingTable,
  bookingDraft,
  bookingDraftItem,
  bookingItem,
  bookingPromotion,
  payment,
  promoCode,
  roomInventory,
  roomRate,
  taxFee as taxFeeTable,
} from "../../drizzle/schema";
import {
  BOOKING_SOURCES,
  BOOKING_STATUS,
  PAYMENT_METHODS,
  PAYMENT_PROCESSORS,
  PAYMENT_STATUS,
} from "../constants";
import { getDb } from "../db";
import { CustomerService } from "./customer.service";
import { BookingRepository } from "../repositories/booking.repository";
import { BookingDraftRepository } from "../repositories/booking_draft.repository";
import { CustomerRepository } from "../repositories/customer.repository";

import type {
  CreateDraftBookingRequestSchema,
  ProcessPaymentRequestSchema,
  ConfirmBookingFromDraftRequestSchema,
  PendingBookingsQuerySchema,
} from "../schemas";
import type { z } from "zod";

function generateReferenceCode(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${Date.now().toString().slice(-6)}-${rand}`;
}

export class BookingService {
  static async createDraft(
    db: D1Database,
    payload: z.infer<typeof CreateDraftBookingRequestSchema>,
    userId?: number,
  ) {
    const database = getDb(db);
    const ref = generateReferenceCode();

    // Ensure availability for each night
    const inv = await database
      .select()
      .from(roomInventory)
      .where(
        and(
          eq(roomInventory.roomTypeId, payload.roomTypeId),
          between(
            roomInventory.date,
            payload.checkInDate,
            payload.checkOutDate,
          ),
          eq(roomInventory.closed, 0),
        ),
      );
    if (!inv.length) throw new Error("validation: no availability");

    // Compute base total from roomRate
    const rates = await database
      .select({ priceCents: roomRate.priceCents })
      .from(roomRate)
      .where(
        and(
          eq(roomRate.roomTypeId, payload.roomTypeId),
          between(roomRate.date, payload.checkInDate, payload.checkOutDate),
        ),
      );
    if (!rates.length) throw new Error("validation: pricing unavailable");
    const baseTotal = rates.reduce(
      (acc, r) => acc + (r.priceCents as number),
      0,
    );

    // Taxes/fees
    const taxes = await database
      .select()
      .from(taxFeeTable)
      .where(eq(taxFeeTable.hotelId, payload.hotelId));

    let taxAmount = 0;
    let feeAmount = 0;
    for (const t of taxes as any[]) {
      if (t.isActive !== 1) continue;
      if (t.type === "percent") {
        const basis = baseTotal; // simplified basis
        const value = Math.round((basis * t.value) / 100);
        if (t.name?.toLowerCase().includes("tax")) taxAmount += value;
        else feeAmount += value;
      } else if (t.type === "fixed") {
        // scope handling simplified
        const nights = rates.length;
        const persons = (payload.numAdults ?? 1) + (payload.numChildren ?? 0);
        let multiplier = 1;
        if (t.scope === "per_night") multiplier = nights;
        else if (t.scope === "per_person") multiplier = persons;
        feeAmount += t.value * multiplier;
      }
    }

    // Discount via promo code could be added via promo repo/service; omitted for brevity
    const discountAmount = 0;

    const totalAmount = baseTotal + taxAmount + feeAmount - discountAmount;

    const draft = await BookingRepository.createDraft(db, {
      referenceCode: ref,
      hotelId: payload.hotelId,
      userId: userId ?? null,
      roomTypeId: payload.roomTypeId,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      numAdults: payload.numAdults,
      numChildren: payload.numChildren,
      currencyCode: "INR",
      // contactEmail will be added later when available
      amounts: {
        baseAmountCents: baseTotal,
        taxAmountCents: taxAmount,
        feeAmountCents: feeAmount,
        discountAmountCents: discountAmount,
        totalAmountCents: totalAmount,
        balanceDueCents: totalAmount,
      },
    });

    await BookingRepository.addLineItems(
      db,
      draft.id,
      payload.roomTypeId,
      payload.ratePlanId ?? null,
      payload.checkInDate,
      payload.checkOutDate,
    );

    await BookingRepository.updateTotals(db, draft.id, {
      totalAmountCents: totalAmount,
      taxAmountCents: taxAmount,
      feeAmountCents: feeAmount,
      discountAmountCents: discountAmount,
      balanceDueCents: totalAmount,
    });

    return draft;
  }

  static async processPayment(
    db: D1Database,
    bookingId: number,
    payload: z.infer<typeof ProcessPaymentRequestSchema>,
  ) {
    // For demo: mark payment succeeded and reduce balance
    const payment = await BookingRepository.createPayment(
      db,
      bookingId,
      payload.amountCents,
      payload.currencyCode,
      payload.method,
      payload.processor,
      payload.processorPaymentId,
    );

    const database = getDb(db);
    const rows = await database
      .select({ balance: bookingTable.balanceDueCents })
      .from(bookingTable)
      .where(eq(bookingTable.id, bookingId));
    const current = (rows as any)[0]?.balance ?? 0;
    const nextBalance = Math.max(0, current - payload.amountCents);
    await BookingRepository.updateTotals(db, bookingId, {
      balanceDueCents: nextBalance,
    });
    return payment;
  }

  static async confirm(db: D1Database, bookingId: number) {
    await BookingRepository.markStatus(db, bookingId, "confirmed");
  }

  /**
   * Confirms a booking from a guest session draft with comprehensive validation
   * Supports multiple booking sources (web, front_office, phone, email, mobile_app)
   * and payment methods (card, cash, bank_transfer, upi, netbanking, wallet)
   */
  static async confirmBookingFromDraftWithTransaction(
    db: D1Database,
    payload: z.infer<typeof ConfirmBookingFromDraftRequestSchema>,
  ) {
    const database = getDb(db);

    // Step 1: Find booking draft by sessionId
    const draft = await database
      .select()
      .from(bookingDraft)
      .where(eq(bookingDraft.sessionId, payload.sessionId))
      .limit(1);

    if (!draft.length) {
      throw new Error("booking.draftNotFound");
    }

    const bookingDraftData = draft[0] as any;

    // Step 2: Get draft items for validation
    const draftItems = await database
      .select()
      .from(bookingDraftItem)
      .where(eq(bookingDraftItem.bookingDraftId, bookingDraftData.id));

    if (!draftItems.length) {
      throw new Error("booking.invalidDateRange");
    }

    // Step 3: Validate guest information
    if (!payload.guestName || !payload.contactEmail) {
      throw new Error("booking.missingGuestInfo");
    }

    // Step 4: Validate promo code if present
    let promoCodeData = null;
    let discountAmountCents = bookingDraftData.discountAmountCents || 0;

    if (bookingDraftData.promoCode) {
      const promoCodes = await database
        .select()
        .from(promoCode)
        .where(
          and(
            eq(promoCode.code, bookingDraftData.promoCode),
            eq(promoCode.hotelId, bookingDraftData.hotelId),
            eq(promoCode.isActive, 1),
          ),
        )
        .limit(1);

      if (!promoCodes.length) {
        throw new Error("booking.invalidPromoCode");
      }

      promoCodeData = promoCodes[0] as any;

      // Check validity dates
      const now = new Date().toISOString().split("T")[0];
      if (promoCodeData.startDate && now < promoCodeData.startDate) {
        throw new Error("booking.invalidPromoCode");
      }
      if (promoCodeData.endDate && now > promoCodeData.endDate) {
        throw new Error("booking.promoCodeExpired");
      }

      // Check usage limit
      if (
        promoCodeData.usageLimit &&
        promoCodeData.usageCount >= promoCodeData.usageLimit
      ) {
        throw new Error("booking.promoCodeUsageLimitReached");
      }

      // Calculate discount
      const baseAmount = bookingDraftData.baseAmountCents;
      if (promoCodeData.type === "percent") {
        discountAmountCents = Math.round(
          (baseAmount * promoCodeData.value) / 100,
        );
      } else if (promoCodeData.type === "fixed") {
        discountAmountCents = promoCodeData.value;
      }

      // Apply maximum discount limit if set
      if (
        promoCodeData.maxDiscountCents &&
        discountAmountCents > promoCodeData.maxDiscountCents
      ) {
        discountAmountCents = promoCodeData.maxDiscountCents;
      }
    }

    // Step 5: Validate inventory availability for each date
    const dates = draftItems.map((item: any) => item.date);
    const uniqueDates = [...new Set(dates)];

    for (const date of uniqueDates) {
      const inventory = await database
        .select()
        .from(roomInventory)
        .where(
          and(
            eq(roomInventory.roomTypeId, bookingDraftData.roomTypeId),
            eq(roomInventory.date, date),
            eq(roomInventory.closed, 0),
          ),
        )
        .limit(1);

      if (!inventory.length || inventory[0].availableRooms <= 0) {
        throw new Error("booking.insufficientInventory");
      }
    }

    // Step 6: Create booking with proper amounts
    const finalTotalAmount =
      bookingDraftData.baseAmountCents +
      bookingDraftData.taxAmountCents +
      bookingDraftData.feeAmountCents -
      discountAmountCents;

    // Determine booking source and user context
    const bookingSource = payload.source || BOOKING_SOURCES.WEB;
    const bookingUserId = payload.userId || null;

    // Build notes with guest information and booking context
    let notes = `Guest: ${payload.guestName}, Email: ${payload.contactEmail}`;
    if (payload.contactPhone) {
      notes += `, Phone: ${payload.contactPhone}`;
    }

    // Add source information for tracking
    notes += `, Source: ${bookingSource}`;

    // Add user context if booking is made by staff for guest
    if (bookingUserId && bookingUserId !== payload.userId) {
      notes += `, Created by User ID: ${bookingUserId}`;
    }

    // Add payment context
    if (payload.isPrepaid) {
      notes += `, Payment: ${payload.paymentMethod} via ${payload.paymentProcessor}`;
    }

    const newBooking = await database
      .insert(bookingTable)
      .values({
        referenceCode: generateReferenceCode(),
        hotelId: bookingDraftData.hotelId,
        userId: bookingUserId,
        status: BOOKING_STATUS.CONFIRMED,
        source: bookingSource,
        checkInDate: bookingDraftData.checkInDate,
        checkOutDate: bookingDraftData.checkOutDate,
        numAdults: bookingDraftData.numAdults,
        numChildren: bookingDraftData.numChildren,
        totalAmountCents: finalTotalAmount,
        currencyCode: bookingDraftData.currencyCode,
        taxAmountCents: bookingDraftData.taxAmountCents,
        feeAmountCents: bookingDraftData.feeAmountCents,
        discountAmountCents: discountAmountCents,
        balanceDueCents: payload.isPrepaid ? 0 : finalTotalAmount,
        notes: notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any)
      .returning();

    const booking = newBooking[0] as any;

    // Step 7: Create booking items from draft items
    for (const draftItem of draftItems as any[]) {
      await database.insert(bookingItem).values({
        bookingId: booking.id,
        roomTypeId: bookingDraftData.roomTypeId,
        ratePlanId: bookingDraftData.ratePlanId,
        date: draftItem.date,
        priceCents: draftItem.priceCents,
        taxAmountCents: draftItem.taxAmountCents,
        feeAmountCents: draftItem.feeAmountCents,
        createdAt: new Date().toISOString(),
      } as any);
    }

    // Step 8: Create booking promotion if promo code was used
    if (promoCodeData && discountAmountCents > 0) {
      await database.insert(bookingPromotion).values({
        bookingId: booking.id,
        promoCodeId: promoCodeData.id,
        amountCents: discountAmountCents,
        createdAt: new Date().toISOString(),
      } as any);

      // Update promo code usage count
      await database
        .update(promoCode)
        .set({
          usageCount: promoCodeData.usageCount + 1,
          updatedAt: new Date().toISOString(),
        } as any)
        .where(eq(promoCode.id, promoCodeData.id));
    }

    // Step 9: Update room inventory for each date
    for (const date of uniqueDates) {
      // Get current inventory to decrement
      const currentInventory = await database
        .select()
        .from(roomInventory)
        .where(
          and(
            eq(roomInventory.roomTypeId, bookingDraftData.roomTypeId),
            eq(roomInventory.date, date),
          ),
        )
        .limit(1);

      if (currentInventory.length) {
        await database
          .update(roomInventory)
          .set({
            availableRooms: Math.max(0, currentInventory[0].availableRooms - 1),
            updatedAt: new Date().toISOString(),
          } as any)
          .where(
            and(
              eq(roomInventory.roomTypeId, bookingDraftData.roomTypeId),
              eq(roomInventory.date, date),
            ),
          );
      }
    }

    // Step 10: Create payment record if prepaid
    if (payload.isPrepaid) {
      // Determine payment status based on method and processor
      let paymentStatus: string = PAYMENT_STATUS.SUCCEEDED;
      if (
        payload.paymentMethod === PAYMENT_METHODS.PENDING ||
        payload.paymentMethod === PAYMENT_METHODS.CASH ||
        payload.paymentProcessor === PAYMENT_PROCESSORS.MANUAL ||
        payload.paymentProcessor === PAYMENT_PROCESSORS.FRONT_OFFICE
      ) {
        paymentStatus = PAYMENT_STATUS.PENDING;
      }

      await database.insert(payment).values({
        bookingId: booking.id,
        amountCents: finalTotalAmount,
        currencyCode: bookingDraftData.currencyCode,
        status: paymentStatus,
        method: payload.paymentMethod || PAYMENT_METHODS.PENDING,
        processor: payload.paymentProcessor || PAYMENT_PROCESSORS.MANUAL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);
    }

    // Step 11: Delete booking draft and items
    await database
      .delete(bookingDraftItem)
      .where(eq(bookingDraftItem.bookingDraftId, bookingDraftData.id));

    await database
      .delete(bookingDraft)
      .where(eq(bookingDraft.id, bookingDraftData.id));

    return booking;
  }

  /**
   * Retrieves pending booking drafts with filtering and pagination
   * Useful for admin follow-up and abandoned cart recovery
   */
  static async getPendingBookings(
    db: D1Database,
    query: z.infer<typeof PendingBookingsQuerySchema>,
  ) {
    const filters = {
      hotelId: query.hotelId,
      olderThan: query.olderThan,
      checkInAfter: query.checkInAfter,
      checkInBefore: query.checkInBefore,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    const result = await BookingDraftRepository.findPendingBookings(
      db,
      filters,
    );

    return {
      bookings: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      },
    };
  }

  /**
   * Create a direct customer booking without using the draft system
   * Used for front desk bookings, phone bookings, and walk-in customers
   */
  static async createDirectCustomerBooking(
    db: D1Database,
    payload: {
      hotelId: number;
      roomTypeId: number;
      ratePlanId?: number | null;
      checkInDate: string;
      checkOutDate: string;
      numAdults: number;
      numChildren: number;
      petsCount?: number;
      promoCode?: string;

      // Customer information
      customerData: {
        email: string;
        fullName: string;
        phone?: string;
        alternatePhone?: string;
        dateOfBirth?: string;
        gender?: "male" | "female" | "other";
        nationality?: string;
        idType?: string;
        idNumber?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
        dietaryPreferences?: string[];
        specialRequests?: string[];
        emergencyContactName?: string;
        emergencyContactPhone?: string;
        loyaltyNumber?: string;
        marketingOptIn?: boolean;
        notes?: string;
      };

      // Booking context
      adminId?: number; // Admin creating the booking
      source?: "web" | "front_office" | "phone" | "email" | "mobile_app";

      // Payment information
      isPrepaid?: boolean;
      paymentMethod?: string;
      paymentProcessor?: string;
      processorPaymentId?: string;
    },
  ) {
    const database = getDb(db);

    // Step 1: Find or create customer
    const customerResult = await CustomerService.findOrCreateCustomer(db, {
      ...payload.customerData,
      source: payload.source || "front_office",
    });

    const customer = customerResult.customer;

    // Step 2: Validate inventory availability
    const inv = await database
      .select()
      .from(roomInventory)
      .where(
        and(
          eq(roomInventory.roomTypeId, payload.roomTypeId),
          between(
            roomInventory.date,
            payload.checkInDate,
            payload.checkOutDate,
          ),
          eq(roomInventory.closed, 0),
        ),
      );

    if (!inv.length) {
      throw new Error("booking.noAvailability");
    }

    // Check if any date has insufficient inventory
    for (const invItem of inv) {
      if (invItem.availableRooms <= 0) {
        throw new Error("booking.insufficientInventory");
      }
    }

    // Step 3: Calculate pricing
    const rates = await database
      .select({ priceCents: roomRate.priceCents, date: roomRate.date })
      .from(roomRate)
      .where(
        and(
          eq(roomRate.roomTypeId, payload.roomTypeId),
          between(roomRate.date, payload.checkInDate, payload.checkOutDate),
        ),
      );

    if (!rates.length) {
      throw new Error("booking.pricingUnavailable");
    }

    const baseTotal = rates.reduce(
      (acc, r) => acc + (r.priceCents as number),
      0,
    );

    // Step 4: Calculate taxes and fees
    const taxes = await database
      .select()
      .from(taxFeeTable)
      .where(eq(taxFeeTable.hotelId, payload.hotelId));

    let taxAmount = 0;
    let feeAmount = 0;
    for (const t of taxes as any[]) {
      if (t.isActive !== 1) continue;
      if (t.type === "percent") {
        const basis = baseTotal;
        const value = Math.round((basis * t.value) / 100);
        if (t.name?.toLowerCase().includes("tax")) taxAmount += value;
        else feeAmount += value;
      } else if (t.type === "fixed") {
        const nights = rates.length;
        const persons = payload.numAdults + (payload.numChildren || 0);
        let multiplier = 1;
        if (t.scope === "per_night") multiplier = nights;
        else if (t.scope === "per_person") multiplier = persons;
        feeAmount += t.value * multiplier;
      }
    }

    // Step 5: Handle promo code if provided
    let discountAmount = 0;
    let promoCodeData = null;

    if (payload.promoCode) {
      const promoCodes = await database
        .select()
        .from(promoCode)
        .where(
          and(
            eq(promoCode.code, payload.promoCode),
            eq(promoCode.hotelId, payload.hotelId),
            eq(promoCode.isActive, 1),
          ),
        )
        .limit(1);

      if (!promoCodes.length) {
        throw new Error("booking.invalidPromoCode");
      }

      promoCodeData = promoCodes[0] as any;

      // Check validity and usage
      const now = new Date().toISOString().split("T")[0];
      if (promoCodeData.startDate && now < promoCodeData.startDate) {
        throw new Error("booking.promoCodeNotYetValid");
      }
      if (promoCodeData.endDate && now > promoCodeData.endDate) {
        throw new Error("booking.promoCodeExpired");
      }
      if (
        promoCodeData.usageLimit &&
        promoCodeData.usageCount >= promoCodeData.usageLimit
      ) {
        throw new Error("booking.promoCodeUsageLimitReached");
      }

      // Calculate discount
      if (promoCodeData.type === "percent") {
        discountAmount = Math.round((baseTotal * promoCodeData.value) / 100);
      } else if (promoCodeData.type === "fixed") {
        discountAmount = promoCodeData.value;
      }

      if (
        promoCodeData.maxDiscountCents &&
        discountAmount > promoCodeData.maxDiscountCents
      ) {
        discountAmount = promoCodeData.maxDiscountCents;
      }
    }

    const finalTotalAmount = baseTotal + taxAmount + feeAmount - discountAmount;

    // Step 6: Create booking
    const bookingSource = payload.source || BOOKING_SOURCES.FRONT_OFFICE;

    let notes = `Customer: ${customer.fullName}, Email: ${customer.email}`;
    if (customer.phone) notes += `, Phone: ${customer.phone}`;
    notes += `, Source: ${bookingSource}`;
    if (payload.adminId) notes += `, Created by Admin ID: ${payload.adminId}`;
    if (payload.isPrepaid) {
      notes += `, Payment: ${payload.paymentMethod || "pending"} via ${payload.paymentProcessor || "manual"}`;
    }

    const newBooking = await database
      .insert(bookingTable)
      .values({
        referenceCode: generateReferenceCode(),
        hotelId: payload.hotelId,
        userId: null, // Direct customer booking, no user account
        customerId: customer.id,
        adminId: payload.adminId || null,
        status: BOOKING_STATUS.CONFIRMED,
        source: bookingSource,
        checkInDate: payload.checkInDate,
        checkOutDate: payload.checkOutDate,
        numAdults: payload.numAdults,
        numChildren: payload.numChildren || 0,
        totalAmountCents: finalTotalAmount,
        currencyCode: "INR",
        taxAmountCents: taxAmount,
        feeAmountCents: feeAmount,
        discountAmountCents: discountAmount,
        balanceDueCents: payload.isPrepaid ? 0 : finalTotalAmount,
        notes: notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any)
      .returning();

    const booking = newBooking[0] as any;

    // Step 7: Create booking items
    for (const rate of rates) {
      await database.insert(bookingItem).values({
        bookingId: booking.id,
        roomTypeId: payload.roomTypeId,
        ratePlanId: payload.ratePlanId || null,
        date: rate.date,
        priceCents: rate.priceCents,
        taxAmountCents: Math.round((rate.priceCents * taxAmount) / baseTotal),
        feeAmountCents: Math.round((rate.priceCents * feeAmount) / baseTotal),
        createdAt: new Date().toISOString(),
      } as any);
    }

    // Step 8: Handle promo code usage
    if (promoCodeData && discountAmount > 0) {
      await database.insert(bookingPromotion).values({
        bookingId: booking.id,
        promoCodeId: promoCodeData.id,
        amountCents: discountAmount,
        createdAt: new Date().toISOString(),
      } as any);

      // Update promo code usage count
      await database
        .update(promoCode)
        .set({
          usageCount: promoCodeData.usageCount + 1,
          updatedAt: new Date().toISOString(),
        } as any)
        .where(eq(promoCode.id, promoCodeData.id));
    }

    // Step 9: Update room inventory
    const uniqueDates = [...new Set(rates.map((r: any) => r.date))];
    for (const date of uniqueDates) {
      await database
        .update(roomInventory)
        .set({
          availableRooms: sql`${roomInventory.availableRooms} - 1`,
          updatedAt: new Date().toISOString(),
        } as any)
        .where(
          and(
            eq(roomInventory.roomTypeId, payload.roomTypeId),
            eq(roomInventory.date, date),
          ),
        );
    }

    // Step 10: Create payment record if prepaid
    if (payload.isPrepaid) {
      let paymentStatus: string = PAYMENT_STATUS.SUCCEEDED;
      if (
        payload.paymentMethod === PAYMENT_METHODS.PENDING ||
        payload.paymentMethod === PAYMENT_METHODS.CASH ||
        payload.paymentProcessor === PAYMENT_PROCESSORS.MANUAL ||
        payload.paymentProcessor === PAYMENT_PROCESSORS.FRONT_OFFICE
      ) {
        paymentStatus = PAYMENT_STATUS.PENDING;
      }

      await database.insert(payment).values({
        bookingId: booking.id,
        amountCents: finalTotalAmount,
        currencyCode: "INR",
        status: paymentStatus,
        method: payload.paymentMethod || PAYMENT_METHODS.PENDING,
        processor: payload.paymentProcessor || PAYMENT_PROCESSORS.MANUAL,
        processorPaymentId: payload.processorPaymentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);
    }

    // Step 11: Update customer's last booking timestamp
    await CustomerRepository.updateLastBookingAt(db, customer.id);

    return {
      booking,
      customer,
      isNewCustomer: customerResult.isNew,
    };
  }
}
