import dayjs from "dayjs";
import { and, eq, inArray } from "drizzle-orm";

import {
  bookingAddon,
  bookingItems,
  bookingPromotion,
  customer,
  roomTypeAddon,
  booking as bookingTable,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { BookingRepository } from "../repositories/booking.repository";
import { PromoCodeRepository } from "../repositories/promo_code.repository";

import type { BookingsQuerySchema, CreateBookingRequest } from "../schemas";
import type { z } from "zod";

function generateReferenceCode(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${Date.now().toString().slice(-6)}-${rand}`;
}

export class BookingService {
  static async listBookings(
    db: D1Database,
    query: z.infer<typeof BookingsQuerySchema>,
  ) {
    const result = await BookingRepository.findBookings(db, {
      ...query,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status as any,
    });

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

  static async getBookingById(db: D1Database, id: number) {
    const booking = await BookingRepository.findById(db, id);
    if (!booking) {
      return null;
    }
    return booking;
  }

  static async updateBooking(db: D1Database, id: number, data: any) {
    const database = getDb(db);

    // First get the existing booking to find the customer
    const booking = await BookingRepository.findById(db, id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Update booking data
    const bookingData: any = {
      checkInDate: data.bookingDetails.checkInDate,
      checkOutDate: data.bookingDetails.checkOutDate,
      numAdults: data.bookingDetails.numAdults,
      numChildren: data.bookingDetails.numChildren,
      status: data.bookingDetails.status,
      updatedAt: new Date().toISOString(),
    };

    // Include amountPaidCents if provided
    if (data.amountPaidCents !== undefined) {
      bookingData.amountPaidCents = data.amountPaidCents;
      // Recalculate balance due
      bookingData.balanceDueCents =
        booking.totalAmountCents - data.amountPaidCents;

      // Update payment status
      if (data.amountPaidCents <= 0) {
        bookingData.paymentStatus = "pending";
      } else if (bookingData.balanceDueCents <= 0) {
        bookingData.paymentStatus = "paid";
      } else {
        bookingData.paymentStatus = "partial";
      }
    }

    // Update customer data if provided
    if (data.customerData && booking.customerId) {
      const customerData: any = {
        fullName: data.customerData.fullName,
        email: data.customerData.email,
        phone: data.customerData.phone,
        alternatePhone: data.customerData.alternatePhone,
        nationality: data.customerData.nationality,
        idType: data.customerData.idType,
        idNumber: data.customerData.idNumber,
        emergencyContactName: data.customerData.emergencyContactName,
        emergencyContactPhone: data.customerData.emergencyContactPhone,
        notes: data.customerData.notes,
        updatedAt: new Date().toISOString(),
      };

      await database
        .update(customer)
        .set(customerData)
        .where(eq(customer.id, booking.customerId));
    }

    await BookingRepository.update(db, id, bookingData);

    const roomTypeId =
      data.bookingDetails?.roomTypeId ??
      booking.items?.[0]?.booking_item?.roomTypeId;
    if (roomTypeId) {
      // Update rooms
      if (data.selectedRooms) {
        await database
          .delete(bookingItems)
          .where(eq(bookingItems.bookingId, id));

        if (data.selectedRooms.length > 0) {
          const newItems = data.selectedRooms.map((r: { id: number }) => ({
            bookingId: id,
            roomId: r.id,
            roomTypeId,
          }));
          await database.insert(bookingItems).values(newItems);
        }
      }

      // Update addons
      if (data.selectedAddons) {
        await database
          .delete(bookingAddon)
          .where(eq(bookingAddon.bookingId, id));

        const addonIds = data.selectedAddons.map((a: { id: number }) => a.id);

        if (addonIds.length > 0) {
          const addonPrices = await database
            .select()
            .from(roomTypeAddon)
            .where(
              and(
                eq(roomTypeAddon.roomTypeId, roomTypeId),
                inArray(roomTypeAddon.addonId, addonIds),
              ),
            );

          const priceMap = new Map(
            addonPrices.map((p) => [p.addonId, p.priceCents]),
          );

          const newAddons = addonIds.map((addonId: number) => ({
            bookingId: id,
            addonId,
            roomTypeId,
            priceCents: priceMap.get(addonId) ?? 0,
            quantity: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

          await database.insert(bookingAddon).values(newAddons);
        }
      }
    }
    return await BookingRepository.findById(db, id);
  }

  static async checkinBooking(db: D1Database, bookingId: number) {
    await BookingRepository.updateStatus(db, bookingId, "checkedin");
  }

  static async cancelBooking(db: D1Database, bookingId: number) {
    await BookingRepository.updateStatus(db, bookingId, "cancelled");
  }

  static async checkoutBooking(db: D1Database, bookingId: number) {
    await BookingRepository.updateStatus(db, bookingId, "checkedout");
  }

  static async createBooking(
    db: D1Database,
    bookingRequest: CreateBookingRequest & { amountPaidCents?: number },
  ) {
    const database = getDb(db);
    const {
      hotelId,
      bookingDetails,
      customerData,
      selectedRooms,
      selectedAddons,
      roomTypeDetails,
      promoCode,
    } = bookingRequest;

    // Simplified total calculation
    const nights = dayjs(bookingDetails.checkOutDate).diff(
      dayjs(bookingDetails.checkInDate),
      "day",
    );
    const roomTotal =
      (roomTypeDetails.basePriceCents ?? 0) * nights * selectedRooms.length;
    const addOnsTotal = (selectedAddons || []).reduce(
      (total, addon) => total + (addon.priceCents ?? 0),
      0,
    );
    const subtotal = roomTotal + addOnsTotal;

    let discountAmountCents = 0;
    let validPromoCode = null;

    if (promoCode) {
      validPromoCode = await PromoCodeRepository.findValidCode(
        db,
        hotelId,
        promoCode,
      );

      if (validPromoCode) {
        if (
          validPromoCode.minAmountCents &&
          subtotal < validPromoCode.minAmountCents
        ) {
          // Promo code not applicable for this amount
          validPromoCode = null;
        } else if (
          validPromoCode.minNights &&
          nights < validPromoCode.minNights
        ) {
          // Promo code not applicable for this duration
          validPromoCode = null;
        } else {
          if (validPromoCode.type === "fixed") {
            discountAmountCents = validPromoCode.value;
          } else if (validPromoCode.type === "percent") {
            discountAmountCents = (subtotal * validPromoCode.value) / 100;
            if (
              validPromoCode.maxDiscountCents &&
              discountAmountCents > validPromoCode.maxDiscountCents
            ) {
              discountAmountCents = validPromoCode.maxDiscountCents;
            }
          }
          discountAmountCents = Math.round(discountAmountCents);
        }
      }
    }

    // Use provided tax and total amounts from frontend, or calculate as fallback
    const taxAmountCents =
      bookingRequest.taxAmountCents ?? Math.round(subtotal * 0.18);
    const totalAmountCents =
      bookingRequest.totalAmountCents ??
      subtotal + taxAmountCents - discountAmountCents;
    const amountPaidCents = bookingRequest.amountPaidCents || 0;
    const balanceDueCents = totalAmountCents - amountPaidCents;

    let paymentStatus = "pending";
    if (amountPaidCents > 0) {
      if (balanceDueCents <= 0) {
        paymentStatus = "paid";
      } else {
        paymentStatus = "partial";
      }
    }

    // Find or create customer
    let customerId: number;
    const existingCustomers = await database
      .select()
      .from(customer)
      .where(eq(customer.email, customerData.email))
      .limit(1);

    const currentTime = new Date().toISOString();

    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
      // Update existing customer with new data
      await database
        .update(customer)
        .set({
          fullName: customerData.fullName,
          phone: customerData.phone,
          alternatePhone: customerData.alternatePhone,
          nationality: customerData.nationality,
          idType: customerData.idType,
          idNumber: customerData.idNumber,
          emergencyContactName: customerData.emergencyContactName,
          emergencyContactPhone: customerData.emergencyContactPhone,
          notes: customerData.notes,
          updatedAt: currentTime,
        })
        .where(eq(customer.id, customerId));
    } else {
      const [newCustomer] = await database
        .insert(customer)
        .values({
          fullName: customerData.fullName,
          email: customerData.email,
          phone: customerData.phone,
          alternatePhone: customerData.alternatePhone,
          nationality: customerData.nationality,
          idType: customerData.idType,
          idNumber: customerData.idNumber,
          emergencyContactName: customerData.emergencyContactName,
          emergencyContactPhone: customerData.emergencyContactPhone,
          notes: customerData.notes,
          firstBookingSource: customerData.firstBookingSource,
          status: "active",
          marketingOptIn: 0,
          createdAt: currentTime,
          updatedAt: currentTime,
        })
        .returning({ id: customer.id });
      customerId = newCustomer.id;
    }

    try {
      const [newBooking] = await database
        .insert(bookingTable)
        .values({
          hotelId,
          customerId,
          referenceCode: generateReferenceCode(),
          checkInDate: bookingDetails.checkInDate,
          checkOutDate: bookingDetails.checkOutDate,
          numAdults: bookingDetails.numAdults,
          numChildren: bookingDetails.numChildren,
          status: bookingDetails.status || "confirmed",
          source: "web",
          totalAmountCents,
          currencyCode: "INR",
          taxAmountCents,
          feeAmountCents: 0,
          discountAmountCents,
          amountPaidCents,
          balanceDueCents,
          paymentStatus,
          paymentMethod: "card",
          paymentProcessor: "stripe",
          createdAt: currentTime,
          updatedAt: currentTime,
        })
        .returning();

      if (validPromoCode) {
        await database.insert(bookingPromotion).values({
          bookingId: newBooking.id,
          promoCodeId: validPromoCode.id,
          amountCents: discountAmountCents,
        });

        await PromoCodeRepository.update(db, validPromoCode.id, {
          usageCount: (validPromoCode.usageCount || 0) + 1,
        });
      }

      await database.insert(bookingItems).values(
        selectedRooms.map((r) => ({
          bookingId: newBooking.id,
          roomTypeId: roomTypeDetails.id,
          roomId: r.id,
        })),
      );

      if (selectedAddons && selectedAddons.length > 0) {
        await database.insert(bookingAddon).values(
          selectedAddons.map((a) => ({
            bookingId: newBooking.id,
            roomTypeId: roomTypeDetails.id,
            addonId: a.id,
            priceCents: a.priceCents,
            quantity: 1,
            createdAt: currentTime,
            updatedAt: currentTime,
          })),
        );
      }

      return newBooking;
    } catch (error) {
      console.error("Error creating booking:", error);
      console.error("Error details:", {
        message: (error as Error).message,
        stack: (error as Error).stack,
        bookingRequest: JSON.stringify(bookingRequest, null, 2),
      });
      throw new Error(
        `booking.createFailed: ${(error as Error).message || "Unknown error"}`,
      );
    }
  }
}
