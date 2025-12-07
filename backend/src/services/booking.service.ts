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
import { AddonRepository } from "../repositories/addon.repository";
import { BookingRepository } from "../repositories/booking.repository";
import { HotelRepository } from "../repositories/hotel.repository";
import { PromoCodeRepository } from "../repositories/promo_code.repository";
import { RoomTypeRepository } from "../repositories/room_type.repository";
import { sendBookingConfirmationEmail } from "../utils/mail";

import type { BookingsQuerySchema, CreateBookingRequest } from "../schemas";
import type { AppContext } from "../types";
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

          // Calculate room rent
          const addonsTotal =
            updatedBooking.addons?.reduce(
              (sum: number, addon: any) => sum + (addon.priceCents || 0),
              0,
            ) || 0;
          const subtotal =
            updatedBooking.totalAmountCents -
            updatedBooking.taxAmountCents +
            updatedBooking.discountAmountCents;
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

  static async cancelBooking(db: D1Database, bookingId: number) {
    await BookingRepository.updateStatus(db, bookingId, "cancelled");
  }

  static async checkoutBooking(db: D1Database, bookingId: number) {
    await BookingRepository.updateStatus(db, bookingId, "checkedout");
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

      // Send booking confirmation email
      if (context) {
        try {
          // Fetch hotel and room type details for email
          const hotel = await HotelRepository.findById(db, hotelId);
          const roomType = await RoomTypeRepository.findById(
            db,
            roomTypeDetails.id,
          );

          if (hotel && roomType) {
            // Format currency function
            const formatCurrency = (cents: number) => {
              const symbol =
                newBooking.currencyCode === "INR"
                  ? "₹"
                  : newBooking.currencyCode;
              return `${symbol}${(cents / 100).toFixed(2)}`;
            };

            // Prepare addon details for email
            const addonDetails = selectedAddons
              ? await Promise.all(
                  selectedAddons.map(async (addon) => {
                    const addonInfo = await AddonRepository.findById(
                      db,
                      addon.id,
                    );
                    return `${addonInfo?.name || `Addon #${addon.id}`}: ${formatCurrency(addon.priceCents)}`;
                  }),
                )
              : [];

            await sendBookingConfirmationEmail(context, {
              customerEmail: customerData.email,
              customerName: customerData.fullName,
              bookingReference: newBooking.referenceCode,
              hotelName: hotel.name,
              roomType: roomType.name,
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
