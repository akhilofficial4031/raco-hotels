import { readdirSync } from "fs";

import { scrypt } from "@noble/hashes/scrypt";
import { randomBytes } from "@noble/hashes/utils";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "../drizzle/schema";

// Hash password using the same method as AuthService
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16); // Generate a random 16-byte salt
  const hash = await scrypt(password, salt, {
    N: 2 ** 14,
    r: 8,
    p: 1,
    dkLen: 64,
  });

  // Combine salt and hash for storage
  const combined = new Uint8Array(salt.length + hash.length);
  combined.set(salt);
  combined.set(hash, salt.length);

  return Buffer.from(combined).toString("base64");
}

async function seed() {
  try {
    console.log("🔍 Looking for database file...");

    // For local development, connect to the SQLite database directly
    // Dynamic import to avoid issues with better-sqlite3 types
    const { default: Database } = await import("better-sqlite3");

    // Find the actual database file (it has a hash-based name)
    const dbDir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/";
    const files = readdirSync(dbDir);
    const dbFile = files.find(
      (f) => f.endsWith(".sqlite") && f !== "local-db.sqlite",
    );

    if (!dbFile) {
      throw new Error(
        "Could not find database file. Make sure to run the dev server first to initialize the database.",
      );
    }

    const sqlite = new Database(dbDir + dbFile);
    const db = drizzle(sqlite, { schema });

    console.log("🌱 Starting data seeding...");

    const passwordHash = await hashPassword("password123");

    // 1. Seed Amenities
    console.log("🌱 Seeding amenities...");
    const amenities = await db
      .insert(schema.amenity)
      .values([
        {
          name: "Free Wi-Fi",
          code: "wifi",
          icon: "fa-wifi",
        },
        { name: "Swimming Pool", code: "pool", icon: "fa-person-swimming" },
        { name: "Fitness Center", code: "gym", icon: "fa-dumbbell" },
        { name: "Restaurant", code: "restaurant", icon: "fa-utensils" },
        { name: "Parking", code: "parking", icon: "fa-car" },
        { name: "Spa", code: "spa", icon: "fa-spa" },
        { name: "Air Conditioning", code: "ac", icon: "fa-snowflake" },
        { name: "Television", code: "tv", icon: "fa-tv" },
        { name: "Pet Friendly", code: "pets", icon: "fa-paw" },
      ])
      .returning();
    console.log(`✅ Seeded ${amenities.length} amenities.`);

    // 2. Seed Features
    console.log("🌱 Seeding features...");
    const features = await db
      .insert(schema.feature)
      .values([
        { name: "Ocean View", code: "ocean-view" },
        { name: "Near Beach", code: "beach-access" },
        { name: "Family Friendly", code: "family-friendly" },
        { name: "Business Center", code: "business-center" },
        { name: "Airport Shuttle", code: "airport-shuttle" },
      ])
      .returning();
    console.log(`✅ Seeded ${features.length} features.`);

    // 3. Seed Addons
    console.log("🌱 Seeding addons...");
    await db
      .insert(schema.addon)
      .values([
        {
          name: "Extra Bed",
          category: "bed",
          unitType: "item",
        },
        {
          name: "Breakfast Buffet",
          category: "food",
          unitType: "person",
        },
        {
          name: "Airport Pickup",
          category: "service",
          unitType: "item",
        },
      ])
      .returning();

    // 4. Seed Hotels
    console.log("🌱 Seeding hotels...");
    const hotels = await db
      .insert(schema.hotel)
      .values([
        {
          name: "The Grand Bhagwati",
          slug: "the-grand-bhagwati",
          description:
            "The Grand Bhagwati is a luxury hotel in the heart of the city.",
          email: "info@grandbhagwati.com",
          phone: "+91 1234567890",
          addressLine1: "123, ABC Road",
          city: "Ahmedabad",
          state: "Gujarat",
          postalCode: "380015",
          countryCode: "IN",
          starRating: 5,
        },
        {
          name: "Hyatt Regency",
          slug: "hyatt-regency",
          description:
            "Hyatt Regency is a premium hotel with world-class amenities.",
          email: "info@hyatt.com",
          phone: "+91 9876543210",
          addressLine1: "456, XYZ Road",
          city: "Pune",
          state: "Maharashtra",
          postalCode: "411001",
          countryCode: "IN",
          starRating: 4,
        },
      ])
      .returning();
    console.log(`✅ Seeded ${hotels.length} hotels.`);

    const tgbHotel = hotels.find((h) => h.slug === "the-grand-bhagwati")!;
    const hyattHotel = hotels.find((h) => h.slug === "hyatt-regency")!;

    // 5. Link Amenities and Features to Hotels
    console.log("🌱 Linking amenities and features to hotels...");
    await db.insert(schema.hotelAmenity).values([
      { hotelId: tgbHotel.id, amenityId: amenities[0].id },
      { hotelId: tgbHotel.id, amenityId: amenities[1].id },
      { hotelId: tgbHotel.id, amenityId: amenities[3].id },
      { hotelId: hyattHotel.id, amenityId: amenities[0].id },
      { hotelId: hyattHotel.id, amenityId: amenities[2].id },
      { hotelId: hyattHotel.id, amenityId: amenities[4].id },
    ]);

    await db.insert(schema.hotelFeature).values([
      { hotelId: tgbHotel.id, featureId: features[2].id },
      { hotelId: tgbHotel.id, featureId: features[3].id },
      { hotelId: hyattHotel.id, featureId: features[1].id },
      { hotelId: hyattHotel.id, featureId: features[4].id },
    ]);

    // 6. Seed Room Types
    console.log("🌱 Seeding room types...");
    const roomTypes = await db
      .insert(schema.roomType)
      .values([
        // TGB Room Types
        {
          hotelId: tgbHotel.id,
          name: "Deluxe Room",
          slug: "deluxe-room",
          basePriceCents: 500000,
          totalRooms: 10,
        },
        {
          hotelId: tgbHotel.id,
          name: "Suite",
          slug: "suite",
          basePriceCents: 1000000,
          totalRooms: 5,
        },
        // Hyatt Room Types
        {
          hotelId: hyattHotel.id,
          name: "Standard Room",
          slug: "standard-room",
          basePriceCents: 700000,
          totalRooms: 15,
        },
        {
          hotelId: hyattHotel.id,
          name: "Executive Suite",
          slug: "executive-suite",
          basePriceCents: 1500000,
          totalRooms: 8,
        },
      ])
      .returning();
    console.log(`✅ Seeded ${roomTypes.length} room types.`);

    const tgbDeluxe = roomTypes.find(
      (rt) => rt.hotelId === tgbHotel.id && rt.slug === "deluxe-room",
    )!;
    const hyattStandard = roomTypes.find(
      (rt) => rt.hotelId === hyattHotel.id && rt.slug === "standard-room",
    )!;

    // 7. Seed Room Units
    console.log("🌱 Seeding room units...");
    await db
      .insert(schema.room)
      .values([
        // TGB Deluxe Rooms
        {
          hotelId: tgbHotel.id,
          roomTypeId: tgbDeluxe.id,
          roomNumber: "101",
        },
        {
          hotelId: tgbHotel.id,
          roomTypeId: tgbDeluxe.id,
          roomNumber: "102",
        },
        // Hyatt Standard Rooms
        {
          hotelId: hyattHotel.id,
          roomTypeId: hyattStandard.id,
          roomNumber: "201",
        },
        {
          hotelId: hyattHotel.id,
          roomTypeId: hyattStandard.id,
          roomNumber: "202",
        },
      ])
      .returning();

    // 8. Link amenities to room types
    console.log("🌱 Linking amenities to room types...");
    await db
      .insert(schema.roomTypeAmenity)
      .values([
        { roomTypeId: tgbDeluxe.id, amenityId: amenities[0].id },
        { roomTypeId: tgbDeluxe.id, amenityId: amenities[6].id },
        { roomTypeId: hyattStandard.id, amenityId: amenities[0].id },
        { roomTypeId: hyattStandard.id, amenityId: amenities[7].id },
      ])
      .returning();

    // 9. Seed a User and Customer for reviews
    console.log("🌱 Seeding a sample user and customer...");
    const users = await db
      .insert(schema.user)
      .values([
        {
          email: "customer@example.com",
          passwordHash,
          fullName: "John Doe",
          role: "customer",
          status: "active",
        },
      ])
      .returning();
    const customerUser = users[0];
    console.log(`✅ Seeded user ${customerUser.email}.`);

    const customers = await db
      .insert(schema.customer)
      .values([
        {
          fullName: "John Doe",
          email: "customer@example.com",
        },
      ])
      .returning();
    const mainCustomer = customers[0];
    console.log(`✅ Seeded customer ${mainCustomer.email}.`);

    // 10. Seed Bookings
    console.log("🌱 Seeding bookings...");
    const bookings = await db
      .insert(schema.booking)
      .values([
        {
          hotelId: tgbHotel.id,
          customerId: mainCustomer.id,
          userId: customerUser.id,
          referenceCode: "BK-TGB-123",
          checkInDate: "2024-08-01",
          checkOutDate: "2024-08-05",
          numAdults: 2,
          totalAmountCents: 2000000,
          status: "checked_out",
        },
        {
          hotelId: hyattHotel.id,
          customerId: mainCustomer.id,
          userId: customerUser.id,
          referenceCode: "BK-HYATT-456",
          checkInDate: "2024-07-15",
          checkOutDate: "2024-07-20",
          numAdults: 2,
          totalAmountCents: 3500000,
          status: "checked_out",
        },
      ])
      .returning();
    console.log(`✅ Seeded ${bookings.length} bookings.`);

    const tgbBooking = bookings.find((b) => b.referenceCode === "BK-TGB-123")!;
    const hyattBooking = bookings.find(
      (b) => b.referenceCode === "BK-HYATT-456",
    )!;

    // 11. Seed Reviews
    console.log("🌱 Seeding reviews...");
    const seededReviews = await db
      .insert(schema.review)
      .values([
        {
          hotelId: tgbHotel.id,
          userId: customerUser.id,
          bookingId: tgbBooking.id,
          rating: 5,
          title: "Excellent Stay!",
          body: "The service was exceptional and the rooms were very clean. Highly recommend The Grand Bhagwati.",
          status: "approved",
        },
        {
          hotelId: hyattHotel.id,
          userId: customerUser.id,
          bookingId: hyattBooking.id,
          rating: 4,
          title: "Great experience",
          body: "Enjoyed our time at Hyatt. The gym facilities were top-notch.",
          status: "pending",
        },
      ])
      .returning();
    console.log(`✅ Seeded ${seededReviews.length} reviews.`);

    console.log("✅ Data seeding completed successfully!");
    sqlite.close();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seed().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
