import dayjs from "dayjs";
import { and, eq, gt, inArray, lt, notInArray } from "drizzle-orm";

import {
  bookingAddon,
  bookingChildren,
  bookingItems,
  bookingPromotion,
  customer,
  room as roomUnit,
  roomTypeAddon,
  booking as bookingTable,
} from "../../drizzle/schema";
import { TAX_RATES } from "../constants";
import { getDb } from "../db";
import { PaymentService } from "./payment.service";
import { AddonRepository } from "../repositories/addon.repository";
import { BookingRepository } from "../repositories/booking.repository";
import { HotelRepository } from "../repositories/hotel.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { PromoCodeRepository } from "../repositories/promo_code.repository";
import { RoomTypeRepository } from "../repositories/room_type.repository";
import {
  sendBookingConfirmationEmail,
  sendPaymentConfirmationEmail,
} from "../utils/mail";

import type { BookingsQuerySchema, CreateBookingRequest } from "../schemas";
import type { AppContext } from "../types";
import type { z } from "zod";

function generateReferenceCode(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${Date.now().toString().slice(-6)}-${rand}`;
}

function getEffectiveRoomPrice(roomType: any): number {
  // Check if offer price is available
  if (roomType && roomType.offerPrice && roomType.offerPrice > 0) {
    // If both offer dates are null, use offer price unconditionally
    if (!roomType.offerStartDate && !roomType.offerEndDate) {
      console.log(
        `✅ Using offer price ${roomType.offerPrice} for room type ${roomType.id} (no date restrictions)`,
      );
      return roomType.offerPrice;
    }

    // If we have start and end dates, check if current date is within offer period
    if (roomType.offerStartDate && roomType.offerEndDate) {
      try {
        // Use date-only comparison (ignore time component)
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const offerStart = new Date(roomType.offerStartDate);
        offerStart.setHours(0, 0, 0, 0);

        const offerEnd = new Date(roomType.offerEndDate);
        offerEnd.setHours(23, 59, 59, 999);

        // Validate dates
        if (!isNaN(offerStart.getTime()) && !isNaN(offerEnd.getTime())) {
          // Check if current date is within offer period (inclusive)
          if (currentDate >= offerStart && currentDate <= offerEnd) {
            console.log(
              `✅ Using offer price ${roomType.offerPrice} for room type ${roomType.id} (within offer period)`,
            );
            return roomType.offerPrice;
          } else {
            console.log(
              `Offer price ${roomType.offerPrice} for room type ${roomType.id} is outside valid period`,
            );
          }
        }
      } catch (error) {
        console.error("Error parsing offer dates:", error);
      }
    }
  }

  // Fall back to base price
  console.log(
    `Using base price ${roomType?.basePriceCents} for room type ${roomType?.id}`,
  );
  return roomType?.basePriceCents ?? 0;
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

  static async updateBooking(
    db: D1Database,
    id: number,
    data: any,
    context?: AppContext,
  ) {
    const database = getDb(db);

    // First get the existing booking to find the customer
    const booking = await BookingRepository.findById(db, id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const roomTypeId =
      data.bookingDetails?.roomTypeId ??
      booking.items?.[0]?.booking_item?.roomTypeId;

    // SERVER-SIDE CALCULATION FOR SECURITY
    // Never trust prices from frontend - always recalculate from database
    // Fetch actual prices: room type base price, addon prices
    // Apply promo code discount to subtotal, then calculate tax on discounted amount
    let totalAmountCents = booking.totalAmountCents;
    let taxAmountCents = booking.taxAmountCents;
    let discountAmountCents = booking.discountAmountCents || 0;
    let effectiveRoomPrice = booking.roomPriceCents || 0;

    if (roomTypeId && data.selectedRooms) {
      // Get room type details to get base price
      const roomType = await RoomTypeRepository.findById(db, roomTypeId);
      if (!roomType) {
        throw new Error("Room type not found");
      }

      // Derive effective adult count: numAdults + children aged strictly over 10
      const childrenAgesInput = data.bookingDetails?.childrenAges ?? [];
      const olderChildrenCount = childrenAgesInput.filter(
        (age: number) => age > 10,
      ).length;
      const numAdultsUpdate =
        data.bookingDetails.numAdults ?? booking.numAdults;
      const effectiveAdultsUpdate = numAdultsUpdate + olderChildrenCount;

      // Occupancy validation
      const numRooms = data.selectedRooms.length;
      const maxStandard = (roomType.maxOccupancy ?? 0) * numRooms;
      const maxWithExtra = maxStandard + numRooms;

      if (effectiveAdultsUpdate > maxWithExtra) {
        const requiredRooms = Math.ceil(
          effectiveAdultsUpdate / ((roomType.maxOccupancy ?? 0) + 1),
        );
        throw new Error(
          `validation: Maximum occupancy exceeded. ${effectiveAdultsUpdate} adults cannot be accommodated in ${numRooms} room(s) even with extra adult charges (max ${(roomType.maxOccupancy ?? 0) + 1} per room). Please book at least ${requiredRooms} room(s).`,
        );
      }

      const extraAdultsUpdate = Math.max(
        0,
        effectiveAdultsUpdate - maxStandard,
      );

      // Calculate number of nights before extra adult charge (charge is per adult per night)
      const checkInDate = data.bookingDetails.checkInDate;
      const checkOutDate = data.bookingDetails.checkOutDate;
      const nights = dayjs(checkOutDate).diff(dayjs(checkInDate), "day");

      const extraAdultChargeCentsUpdate =
        extraAdultsUpdate * (roomType.extraAdultChargeCents ?? 100000) * nights;
      const extraAdultTaxCentsUpdate = Math.round(
        extraAdultChargeCentsUpdate * TAX_RATES.EXTRA_ADULT_TAX,
      );

      // Calculate room total using effective price (offer price if available and valid)
      effectiveRoomPrice = getEffectiveRoomPrice(roomType);
      const roomTotal = effectiveRoomPrice * nights * data.selectedRooms.length;

      // Calculate addons total from database prices
      let addOnsTotal = 0;
      if (data.selectedAddons && data.selectedAddons.length > 0) {
        const addonIds = data.selectedAddons.map((a: { id: number }) => a.id);
        const addonPrices = await database
          .select()
          .from(roomTypeAddon)
          .where(
            and(
              eq(roomTypeAddon.roomTypeId, roomTypeId),
              inArray(roomTypeAddon.addonId, addonIds),
            ),
          );

        addOnsTotal = addonPrices.reduce(
          (sum, addon) => sum + (addon.priceCents ?? 0),
          0,
        );
      }

      // Calculate subtotal
      const subtotal = roomTotal + addOnsTotal;

      // Apply promo code discount if exists
      // Check if booking has a promo code applied (existing promo code preserved)
      const bookingPromotions = await database
        .select()
        .from(bookingPromotion)
        .where(eq(bookingPromotion.bookingId, id));

      let existingPromoCodeId: number | null = null;
      if (bookingPromotions.length > 0) {
        existingPromoCodeId = bookingPromotions[0].promoCodeId;
        const promoCode = await PromoCodeRepository.findById(
          db,
          existingPromoCodeId,
        );

        if (promoCode && promoCode.isActive) {
          // Recalculate discount with new subtotal
          if (promoCode.type === "fixed") {
            discountAmountCents = promoCode.value;
          } else if (promoCode.type === "percent") {
            discountAmountCents = Math.round(
              (subtotal * promoCode.value) / 100,
            );
            if (
              promoCode.maxDiscountCents &&
              discountAmountCents > promoCode.maxDiscountCents
            ) {
              discountAmountCents = promoCode.maxDiscountCents;
            }
          }
          // Ensure discount doesn't exceed subtotal
          discountAmountCents = Math.min(discountAmountCents, subtotal);
        } else {
          // Promo code is no longer active, remove it
          discountAmountCents = 0;
          await database
            .delete(bookingPromotion)
            .where(eq(bookingPromotion.bookingId, id));
          existingPromoCodeId = null;
        }
      }

      const subtotalAfterDiscount = Math.max(0, subtotal - discountAmountCents);
      const roomTaxCents = Math.round(
        subtotalAfterDiscount * TAX_RATES.ROOM_TAX,
      );
      taxAmountCents = roomTaxCents + extraAdultTaxCentsUpdate;
      totalAmountCents =
        subtotalAfterDiscount + taxAmountCents + extraAdultChargeCentsUpdate;
    }

    // Update booking data
    const bookingData: any = {
      checkInDate: data.bookingDetails.checkInDate,
      checkOutDate: data.bookingDetails.checkOutDate,
      numAdults: data.bookingDetails.numAdults,
      numChildren: data.bookingDetails.numChildren,
      status: data.bookingDetails.status,
      totalAmountCents,
      taxAmountCents,
      discountAmountCents,
      roomPriceCents: effectiveRoomPrice,
      updatedAt: new Date().toISOString(),
    };

    // Include amountPaidCents if provided
    if (data.amountPaidCents !== undefined) {
      bookingData.amountPaidCents = data.amountPaidCents;
      bookingData.balanceDueCents = totalAmountCents - data.amountPaidCents;

      // Update payment status
      if (data.amountPaidCents <= 0) {
        bookingData.paymentStatus = "pending";
      } else if (bookingData.balanceDueCents <= 0) {
        bookingData.paymentStatus = "paid";
      } else {
        bookingData.paymentStatus = "partial";
      }
    } else {
      // Recalculate balance due if amount paid wasn't updated
      bookingData.balanceDueCents =
        totalAmountCents - (booking.amountPaidCents ?? 0);
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

    // Update child ages for auditing — replace all existing entries
    if (data.bookingDetails?.childrenAges !== undefined) {
      await database
        .delete(bookingChildren)
        .where(eq(bookingChildren.bookingId, id));

      if (data.bookingDetails.childrenAges.length > 0) {
        await database.insert(bookingChildren).values(
          data.bookingDetails.childrenAges.map((age: number) => ({
            bookingId: id,
            age,
          })),
        );
      }
    }

    const updatedBooking = await BookingRepository.findById(db, id);

    // Send updated booking confirmation email
    if (context && updatedBooking && data.customerData?.email) {
      try {
        // Fetch hotel and room type details for email
        const hotel = await HotelRepository.findById(
          db,
          updatedBooking.hotelId,
        );
        const roomType =
          updatedBooking.items && updatedBooking.items.length > 0
            ? await RoomTypeRepository.findById(
                db,
                updatedBooking.items[0].booking_item.roomTypeId,
              )
            : null;

        if (hotel && roomType) {
          // Calculate number of nights
          const nights = dayjs(updatedBooking.checkOutDate).diff(
            dayjs(updatedBooking.checkInDate),
            "day",
          );

          // Format currency function
          const formatCurrency = (cents: number) => {
            const symbol =
              updatedBooking.currencyCode === "INR"
                ? "₹"
                : updatedBooking.currencyCode;
            return `${symbol}${(cents / 100).toFixed(2)}`;
          };

          // Prepare addon details from the booking
          const addonDetails =
            updatedBooking.addons?.map((addon: any) => {
              const name = addon.addon?.name || `Addon #${addon.addonId}`;
              const price = formatCurrency(addon.priceCents);
              return `${name}: ${price}`;
            }) || [];

          // Calculate room rent based on new logic: discount applied before tax
          const addonsTotal =
            updatedBooking.addons?.reduce(
              (sum: number, addon: any) =>
                sum + (addon.booking_addon?.priceCents || 0),
              0,
            ) || 0;
          const subtotalAfterDiscount =
            updatedBooking.totalAmountCents - updatedBooking.taxAmountCents;
          const subtotal =
            subtotalAfterDiscount + updatedBooking.discountAmountCents;
          const roomRent = subtotal - addonsTotal;

          await sendBookingConfirmationEmail(context, {
            customerEmail: data.customerData.email,
            customerName:
              data.customerData.fullName ||
              updatedBooking.customer?.fullName ||
              "Guest",
            bookingReference: updatedBooking.referenceCode,
            hotelName: hotel.name,
            roomType: roomType.name,
            checkInDate: updatedBooking.checkInDate,
            checkOutDate: updatedBooking.checkOutDate,
            numNights: nights,
            numAdults: updatedBooking.numAdults,
            numChildren: updatedBooking.numChildren,
            roomRent: formatCurrency(roomRent),
            addonsList:
              addonDetails.length > 0 ? addonDetails.join(", ") : "None",
            subtotal: formatCurrency(subtotal),
            discount: formatCurrency(updatedBooking.discountAmountCents),
            taxAmount: formatCurrency(updatedBooking.taxAmountCents),
            totalAmount: formatCurrency(updatedBooking.totalAmountCents),
            amountPaid: formatCurrency(updatedBooking.amountPaidCents),
            balanceDue: formatCurrency(updatedBooking.balanceDueCents),
            currencySymbol:
              updatedBooking.currencyCode === "INR"
                ? "₹"
                : updatedBooking.currencyCode,
          });
        }
      } catch (emailError) {
        // Log email error but don't fail the booking update
        console.error(
          "Failed to send updated booking confirmation email:",
          emailError,
        );
        console.error(
          "Booking was updated successfully, but email notification failed",
        );
      }
    }

    return updatedBooking;
  }

  static async checkinBooking(db: D1Database, bookingId: number) {
    await BookingRepository.updateStatus(db, bookingId, "checkedin");
  }

  static async cancelBooking(
    db: D1Database,
    bookingId: number,
    refundAmountCents?: number,
    cancellationReason?: string,
    context?: AppContext,
  ): Promise<{ refundProcessed: boolean; refundMarkedManual: boolean }> {
    // Get booking details
    const booking = await BookingRepository.findById(db, bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    // Validate refund amount is a safe number
    if (refundAmountCents !== undefined && refundAmountCents !== null) {
      if (
        !Number.isFinite(refundAmountCents) ||
        refundAmountCents < 0 ||
        refundAmountCents > Number.MAX_SAFE_INTEGER
      ) {
        throw new Error("Invalid refund amount");
      }
    }

    // Sanitize cancellation reason to prevent injection
    const sanitizedReason = cancellationReason
      ? cancellationReason.substring(0, 500).trim()
      : null;

    let refundProcessed = false;
    let refundMarkedManual = false;

    // Check for payment and process refund if applicable
    if (refundAmountCents && refundAmountCents > 0 && context) {
      try {
        // Get payment details for this booking
        const payments = await PaymentService.getPaymentsByBookingId(
          db,
          bookingId,
        );

        // Find a paid payment
        const paidPayment = payments.find(
          (p) => p.status === "succeeded" || p.status === "paid",
        );

        // Only process refund if there's a paid payment via Razorpay
        if (paidPayment) {
          // Validate refund amount doesn't exceed amount paid (server-side validation)
          if (refundAmountCents > paidPayment.amountCents) {
            throw new Error(
              `Refund amount cannot exceed amount paid (${paidPayment.amountCents / 100} ${booking.currencyCode})`,
            );
          }

          // Process refund via PaymentService
          await PaymentService.processRefund(db, context, {
            paymentId: paidPayment.id,
            amountCents: refundAmountCents,
            notes: {
              booking_reference: booking.referenceCode,
              cancellation_reason: sanitizedReason || "Booking cancellation",
            },
            reason: sanitizedReason || undefined,
          });

          refundProcessed = true;
          console.log(
            `Refund of ${refundAmountCents / 100} ${booking.currencyCode} processed successfully for booking ${booking.referenceCode}`,
          );
        } else {
          // No paid payment found - just log and continue with cancellation
          // The refund amount will be stored in booking record for manual processing
          refundMarkedManual = true;
          console.log(
            `No Razorpay payment found for booking ${booking.referenceCode}. Refund of ${refundAmountCents / 100} ${booking.currencyCode} marked for manual processing.`,
          );
        }
      } catch (error) {
        console.error("Error processing refund:", error);
        // Re-throw with sanitized error message (don't expose internal details)
        const errorMessage = (error as Error).message || "Unknown error";
        throw new Error(`Failed to process refund: ${errorMessage}`);
      }
    }

    // Update booking status to cancelled (single update, no race condition)
    await BookingRepository.update(db, bookingId, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancellationReason: sanitizedReason,
      refundAmountCents: refundAmountCents || null,
      updatedAt: new Date().toISOString(),
    } as any);

    return { refundProcessed, refundMarkedManual };
  }

  static async checkoutBooking(db: D1Database, bookingId: number) {
    await BookingRepository.updateStatus(db, bookingId, "checkedout");
  }

  static async noshowBooking(db: D1Database, bookingId: number) {
    await BookingRepository.updateStatus(db, bookingId, "noshow");
  }

  static async createBooking(
    db: D1Database,
    bookingRequest: CreateBookingRequest & { amountPaidCents?: number },
    context?: AppContext,
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

    // SERVER-SIDE CALCULATION FOR SECURITY
    // Never trust prices from frontend - always fetch from database
    // Fetch the actual room type from database to get real prices and offer details
    const roomTypeFromDb = await RoomTypeRepository.findById(
      db,
      roomTypeDetails.id,
    );
    if (!roomTypeFromDb) {
      throw new Error("Room type not found");
    }

    const nights = dayjs(bookingDetails.checkOutDate).diff(
      dayjs(bookingDetails.checkInDate),
      "day",
    );

    // Step 1 — Derive effective adult count: numAdults + children strictly over age 10
    const childrenAgesInput = bookingDetails.childrenAges ?? [];
    const olderChildrenCount = childrenAgesInput.filter(
      (age) => age > 10,
    ).length;
    const effectiveAdults = bookingDetails.numAdults + olderChildrenCount;
    const maxOccupancy = roomTypeFromDb.maxOccupancy ?? 0;

    // Step 2 — Resolve which physical rooms to use
    // Admin portal: selectedRooms provided explicitly by staff
    // Customer portal: selectedRooms is empty → auto-select available rooms
    let resolvedRooms: Array<{ id: number }>;

    if (selectedRooms && selectedRooms.length > 0) {
      resolvedRooms = selectedRooms;
    } else {
      // Determine the minimum number of rooms needed
      const requestedRooms = bookingDetails.numRooms ?? 1;
      const requiredRooms = Math.ceil(effectiveAdults / (maxOccupancy + 1));
      const finalNumRooms = Math.max(requestedRooms, requiredRooms);

      // Find room units already booked for overlapping dates (any non-cancelled status)
      const conflictingBookedRooms = await database
        .select({ roomId: bookingItems.roomId })
        .from(bookingItems)
        .innerJoin(bookingTable, eq(bookingItems.bookingId, bookingTable.id))
        .where(
          and(
            inArray(bookingTable.status, [
              "confirmed",
              "checkedin",
              "paid",
              "partial_paid",
              "pending_cancellation",
            ]),
            lt(bookingTable.checkInDate, bookingDetails.checkOutDate),
            gt(bookingTable.checkOutDate, bookingDetails.checkInDate),
          ),
        );

      const conflictingIds = conflictingBookedRooms.map((r) => r.roomId);

      // Pick active rooms of this room type that are not already booked
      const availableRooms = await database
        .select({ id: roomUnit.id })
        .from(roomUnit)
        .where(
          and(
            eq(roomUnit.roomTypeId, roomTypeFromDb.id),
            eq(roomUnit.isActive, 1),
            conflictingIds.length > 0
              ? notInArray(roomUnit.id, conflictingIds)
              : undefined,
          ),
        )
        .limit(finalNumRooms);

      if (availableRooms.length < finalNumRooms) {
        throw new Error(
          `validation: Not enough rooms available. Need ${finalNumRooms} room(s) of this type but only ${availableRooms.length} are available for the selected dates.`,
        );
      }

      resolvedRooms = availableRooms;
    }

    // Step 3 — Occupancy check against the resolved room count
    const numRooms = resolvedRooms.length;
    const maxStandard = maxOccupancy * numRooms;
    const maxWithExtra = maxStandard + numRooms; // one extra slot per room

    if (effectiveAdults > maxWithExtra) {
      const requiredRooms = Math.ceil(effectiveAdults / (maxOccupancy + 1));
      throw new Error(
        `validation: Maximum occupancy exceeded. ${effectiveAdults} adults cannot be accommodated in ${numRooms} room(s) even with extra adult charges (max ${maxOccupancy + 1} per room). Please book at least ${requiredRooms} room(s).`,
      );
    }

    // Step 4 — Extra adult charge per night (one per adult beyond the standard max, up to 1 per room)
    const extraAdults = Math.max(0, effectiveAdults - maxStandard);
    const extraAdultChargeCents =
      extraAdults * (roomTypeFromDb.extraAdultChargeCents ?? 100000) * nights;
    const extraAdultTaxCents = Math.round(
      extraAdultChargeCents * TAX_RATES.EXTRA_ADULT_TAX,
    );

    // Use effective room price (offer price if available and valid) from DATABASE
    const effectiveRoomPrice = getEffectiveRoomPrice(roomTypeFromDb);
    const roomTotal = effectiveRoomPrice * nights * selectedRooms.length;

    // Fetch addon prices from database, not from frontend request
    let addOnsTotal = 0;
    const addonPriceMap = new Map<number, number>();
    if (selectedAddons && selectedAddons.length > 0) {
      const addonIds = selectedAddons.map((a: { id: number }) => a.id);
      const addonPrices = await database
        .select()
        .from(roomTypeAddon)
        .where(
          and(
            eq(roomTypeAddon.roomTypeId, roomTypeFromDb.id),
            inArray(roomTypeAddon.addonId, addonIds),
          ),
        );

      addonPrices.forEach((addon) => {
        const price = addon.priceCents ?? 0;
        addonPriceMap.set(addon.addonId, price);
        addOnsTotal += price;
      });
    }

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
          // Ensure discount doesn't exceed subtotal
          discountAmountCents = Math.min(discountAmountCents, subtotal);
        }
      }
    }

    // Always calculate tax and total on server-side for security (never trust frontend)
    // Apply discount to subtotal first, then calculate tax on discounted amount
    // Extra adult charge and its 5% tax are added on top of the discounted room+addon total
    const subtotalAfterDiscount = Math.max(0, subtotal - discountAmountCents);
    const roomTaxAmountCents = Math.round(
      subtotalAfterDiscount * TAX_RATES.ROOM_TAX,
    );
    const taxAmountCents = roomTaxAmountCents + extraAdultTaxCents;
    const totalAmountCents =
      subtotalAfterDiscount + taxAmountCents + extraAdultChargeCents;
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
          roomPriceCents: effectiveRoomPrice,
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
        resolvedRooms.map((r) => ({
          bookingId: newBooking.id,
          roomTypeId: roomTypeFromDb.id,
          roomId: r.id,
        })),
      );

      if (selectedAddons && selectedAddons.length > 0) {
        await database.insert(bookingAddon).values(
          selectedAddons.map((a) => ({
            bookingId: newBooking.id,
            roomTypeId: roomTypeFromDb.id,
            addonId: a.id,
            priceCents: addonPriceMap.get(a.id) ?? 0, // Use price from database, not frontend
            quantity: 1,
            createdAt: currentTime,
            updatedAt: currentTime,
          })),
        );
      }

      // Persist individual child ages for auditing
      const childrenAges = bookingDetails.childrenAges ?? [];
      if (childrenAges.length > 0) {
        await database.insert(bookingChildren).values(
          childrenAges.map((age) => ({
            bookingId: newBooking.id,
            age,
          })),
        );
      }

      // Send booking confirmation email
      const shouldSendEmail = bookingRequest.sendConfirmationEmail !== false; // defaults to true
      if (context && shouldSendEmail) {
        try {
          // Fetch hotel details for email (room type already fetched from database)
          const hotel = await HotelRepository.findById(db, hotelId);

          if (hotel && roomTypeFromDb) {
            // Format currency function
            const formatCurrency = (cents: number) => {
              const symbol =
                newBooking.currencyCode === "INR"
                  ? "₹"
                  : newBooking.currencyCode;
              return `${symbol}${(cents / 100).toFixed(2)}`;
            };

            // Prepare addon details for email using database prices
            const addonDetails = selectedAddons
              ? await Promise.all(
                  selectedAddons.map(async (addon) => {
                    const addonInfo = await AddonRepository.findById(
                      db,
                      addon.id,
                    );
                    const price = addonPriceMap.get(addon.id) ?? 0;
                    return `${addonInfo?.name || `Addon #${addon.id}`}: ${formatCurrency(price)}`;
                  }),
                )
              : [];

            await sendBookingConfirmationEmail(context, {
              customerEmail: customerData.email,
              customerName: customerData.fullName,
              bookingReference: newBooking.referenceCode,
              hotelName: hotel.name,
              roomType: roomTypeFromDb.name,
              checkInDate: bookingDetails.checkInDate,
              checkOutDate: bookingDetails.checkOutDate,
              numNights: nights,
              numAdults: bookingDetails.numAdults,
              numChildren: bookingDetails.numChildren,
              roomRent: formatCurrency(roomTotal),
              addonsList:
                addonDetails.length > 0 ? addonDetails.join(", ") : "None",
              subtotal: formatCurrency(subtotal),
              discount: formatCurrency(discountAmountCents),
              taxAmount: formatCurrency(taxAmountCents),
              totalAmount: formatCurrency(totalAmountCents),
              amountPaid: formatCurrency(amountPaidCents),
              balanceDue: formatCurrency(balanceDueCents),
              currencySymbol:
                newBooking.currencyCode === "INR"
                  ? "₹"
                  : newBooking.currencyCode,
            });
          }
        } catch (emailError) {
          // Log email error but don't fail the booking
          console.error(
            "Failed to send booking confirmation email:",
            emailError,
          );
          console.error(
            "Booking was created successfully, but email notification failed",
          );
        }
      } else if (!shouldSendEmail) {
        console.log("Skipping booking confirmation email as requested");
      }

      return { ...newBooking, numRoomsUsed: resolvedRooms.length };
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

  static async updatePaymentStatus(
    db: D1Database,
    bookingId: number,
    paymentData: {
      paymentStatus?: string;
      amountPaidCents: number;
      paymentMethod?: string;
      paymentProcessor?: string;
      processorPaymentId?: string;
      transactionId?: string;
      notes?: string;
    },
    context?: AppContext,
  ) {
    // Fetch existing booking to validate and get total amount
    const existingBooking = await BookingRepository.findById(db, bookingId);
    if (!existingBooking) {
      const notFoundError = new Error("Booking not found");
      (notFoundError as any).statusCode = 404;
      (notFoundError as any).code = "BOOKING_NOT_FOUND";
      throw notFoundError;
    }

    const { amountPaidCents } = paymentData;
    const totalAmountCents = existingBooking.totalAmountCents ?? 0;

    // Validate that amount paid doesn't exceed total
    if (totalAmountCents > 0 && amountPaidCents > totalAmountCents) {
      throw new Error(
        `Amount paid (${amountPaidCents}) cannot exceed total booking amount (${totalAmountCents})`,
      );
    }

    // Auto-determine payment status if not provided
    let paymentStatus = paymentData.paymentStatus;
    if (!paymentStatus) {
      if (amountPaidCents === 0) {
        paymentStatus = "pending";
      } else if (amountPaidCents >= totalAmountCents) {
        paymentStatus = "paid";
      } else {
        paymentStatus = "partial";
      }
    }

    // Determine booking status based on payment
    let bookingStatus = existingBooking.status; // Keep existing status by default

    // If payment is complete, set booking status to "paid" and ensure amount matches total
    let finalAmountPaid = amountPaidCents;
    if (paymentStatus === "paid" || amountPaidCents >= totalAmountCents) {
      bookingStatus = "paid";
      finalAmountPaid = totalAmountCents; // Ensure amount paid matches total exactly
    } else if (paymentStatus === "partial" && amountPaidCents > 0) {
      bookingStatus = "partial_paid";
    }

    // Recalculate balance due with final amount
    const finalBalanceDue = Math.max(0, totalAmountCents - finalAmountPaid);

    // Calculate transaction amount (difference between new total paid and previous total paid)
    const transactionAmount =
      finalAmountPaid - (existingBooking.amountPaidCents ?? 0);

    // If this is a new payment (amount increased), record it in the payment table
    if (transactionAmount > 0) {
      try {
        await PaymentRepository.create(db, {
          bookingId: bookingId,
          amountCents: transactionAmount,
          currencyCode: existingBooking.currencyCode,
          status: "succeeded", // Mark as succeeded since we are updating payment status
          method: paymentData.paymentMethod || "card",
          processor: paymentData.paymentProcessor || "manual",
          processorPaymentId:
            paymentData.processorPaymentId || paymentData.transactionId,
        });
      } catch (error) {
        console.error("Failed to record payment in payment table:", error);
        // We don't throw here to avoid failing the booking update, but this should be investigated
      }
    }

    // Build update data
    const updateData: any = {
      amountPaidCents: finalAmountPaid,
      balanceDueCents: finalBalanceDue,
      paymentStatus,
      status: bookingStatus,
    };

    // Add optional fields if provided
    if (paymentData.paymentMethod) {
      updateData.paymentMethod = paymentData.paymentMethod;
    }
    if (paymentData.paymentProcessor) {
      updateData.paymentProcessor = paymentData.paymentProcessor;
    }
    if (paymentData.notes) {
      updateData.notes = paymentData.notes;
    }

    // Update the booking record
    await BookingRepository.update(db, bookingId, updateData);

    // Get the updated booking with all relationships
    const updatedBooking = await BookingRepository.findById(db, bookingId);

    // Send payment confirmation email if payment is fully completed
    if (context && updatedBooking && paymentStatus === "paid") {
      try {
        // Fetch hotel and room type details for email
        const hotel = await HotelRepository.findById(
          db,
          updatedBooking.hotelId,
        );
        const roomType =
          updatedBooking.items && updatedBooking.items.length > 0
            ? await RoomTypeRepository.findById(
                db,
                updatedBooking.items[0].booking_item.roomTypeId,
              )
            : null;

        if (hotel && roomType && updatedBooking.customer?.email) {
          // Calculate number of nights
          const nights = dayjs(updatedBooking.checkOutDate).diff(
            dayjs(updatedBooking.checkInDate),
            "day",
          );

          // Format currency function
          const formatCurrency = (cents: number) => {
            return `${(cents / 100).toFixed(2)}`;
          };

          // Prepare addon details from the booking
          const addonDetails =
            updatedBooking.addons?.map((addon: any) => {
              const name = addon.addon?.name || `Addon #${addon.addonId}`;
              const price = formatCurrency(addon.priceCents);
              return `${name}: ₹${price}`;
            }) || [];

          // Calculate room rent based on booking logic: discount applied before tax
          const addonsTotal =
            updatedBooking.addons?.reduce(
              (sum: number, addon: any) =>
                sum + (addon.booking_addon?.priceCents || 0),
              0,
            ) || 0;
          const subtotalAfterDiscount =
            updatedBooking.totalAmountCents - updatedBooking.taxAmountCents;
          const subtotal =
            subtotalAfterDiscount + updatedBooking.discountAmountCents;
          const roomRent = subtotal - addonsTotal;

          await sendPaymentConfirmationEmail(context, {
            customerEmail: updatedBooking.customer.email,
            customerName: updatedBooking.customer.fullName || "Guest",
            bookingReference: updatedBooking.referenceCode,
            hotelName: hotel.name,
            roomType: roomType.name,
            checkInDate: updatedBooking.checkInDate,
            checkOutDate: updatedBooking.checkOutDate,
            numNights: nights,
            numAdults: updatedBooking.numAdults,
            numChildren: updatedBooking.numChildren,
            roomRent: formatCurrency(roomRent),
            addonsList:
              addonDetails.length > 0 ? addonDetails.join(", ") : "None",
            subtotal: formatCurrency(subtotal),
            discount: formatCurrency(updatedBooking.discountAmountCents),
            taxAmount: formatCurrency(updatedBooking.taxAmountCents),
            totalAmount: formatCurrency(updatedBooking.totalAmountCents),
            amountPaid: formatCurrency(updatedBooking.amountPaidCents),
            paymentMethod: updateData.paymentMethod || "Card",
            currencySymbol:
              updatedBooking.currencyCode === "INR"
                ? "₹"
                : updatedBooking.currencyCode,
            paymentDate: new Date().toISOString(),
          });

          console.log(
            `✅ Payment confirmation email sent for booking ${updatedBooking.referenceCode}`,
          );
        }
      } catch (emailError) {
        // Log email error but don't fail the payment update
        console.error("Failed to send payment confirmation email:", emailError);
        console.error(
          "Payment was processed successfully, but email notification failed",
        );
      }
    }

    return updatedBooking;
  }
}
