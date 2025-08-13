## Database schema (Drizzle ORM on Cloudflare D1)

One-by-one listing of all tables with purpose, columns (plus example values), and key constraints/indexes. Schema source: `backend/drizzle/schema/*` (aggregated by `backend/drizzle/schema/index.ts`).

Conventions

- Money: integer cents (e.g., 12999 => $129.99)
- Booleans: 0/1 integers
- Dates: `YYYY-MM-DD` (TEXT)
- Timestamps: TEXT with `CURRENT_TIMESTAMP`
- FKs use cascade/restrict/set null per business rule

Table: amenity

- Purpose: Catalog of reusable amenities.
- Columns: id PK; code UNIQUE ("wifi"); name ("Wi‑Fi"); icon ("wifi"); createdAt; updatedAt.
- Indexes: unique code; index name.

Table: audit_log

- Purpose: Immutable record of admin actions/data changes.
- Columns: id PK; actorUserId FK->user NULL; entityType ("booking"); entityId (555); action ("update"); oldValue/newValue JSON text; createdAt.
- Indexes: (entityType,entityId); actorUserId; action.

Table: booking

- Purpose: Reservation header with lifecycle, totals, and context.
- Columns: id PK; referenceCode UNIQUE ("RACO-8Y3P2K"); hotelId FK->hotel; userId FK->user NULL; status ("confirmed"); source ("web"); checkInDate ("2025-02-12"); checkOutDate ("2025-02-15"); numAdults (2); numChildren (1); totalAmountCents (78900); currencyCode ("USD"); taxAmountCents (6900); feeAmountCents (1500); discountAmountCents (-10000); balanceDueCents (0); notes; cancelledAt; cancellationReason; createdAt; updatedAt.
- Indexes: hotelId; userId; status; (checkInDate,checkOutDate); totalAmountCents.

Table: booking_item

- Purpose: Per-night line items (pricing breakdown) under a booking.
- Columns: id PK; bookingId FK->booking; roomTypeId FK->room_type; ratePlanId FK->rate_plan NULL; date ("2025-02-13"); priceCents (25900); taxAmountCents (2300); feeAmountCents (500); createdAt.
- Constraints: UNIQUE (bookingId,roomTypeId,date). Indexes: bookingId; date.

Table: booking_promotion (junction)

- Purpose: Map applied promo codes to a booking; stores actual discount amount.
- Columns: bookingId FK->booking; promoCodeId FK->promo_code; amountCents (-10000); createdAt.

Table: booking_draft

- Purpose: Guest cart/draft state prior to confirmed booking.
- Columns: id PK; sessionId UNIQUE ("sess_8c8e..."); referenceCode ("RACO-DRAFT-2FQ7"); hotelId FK->hotel; roomTypeId FK->room_type; ratePlanId FK->rate_plan NULL; status ("draft"); checkInDate ("2025-03-10"); checkOutDate ("2025-03-13"); numAdults (2); numChildren (0); petsCount (1); baseAmountCents (74700); taxAmountCents (6700); feeAmountCents (1200); discountAmountCents (-5000); totalAmountCents (76200); balanceDueCents (76200); currencyCode ("USD"); promoCode ("SPRING10"); contactEmail ("guest@example.com"); contactPhone (+1-555-0198); addOnsJson (e.g., [{"code":"parking","qty":1}]); createdAt; updatedAt.
- Indexes: sessionId UNIQUE; hotelId; (checkInDate,checkOutDate).

Table: booking_draft_item

- Purpose: Per-night items for a booking draft.
- Columns: id PK; bookingDraftId FK->booking_draft; date ("2025-03-11"); priceCents (24900); taxAmountCents (2200); feeAmountCents (400); createdAt.
- Indexes: date.

Table: content_block

- Purpose: Simple CMS blocks for site pages; optionally hotel-scoped.
- Columns: id PK; hotelId FK->hotel NULL; page ("home"); section ("hero"); title; body (Markdown/HTML); mediaUrl; sortOrder (10); isVisible (1); createdAt; updatedAt.
- Indexes: page; section; hotelId.

Table: feature

- Purpose: Catalog of hotel-level features (discoverability/filters).
- Columns: id PK; code UNIQUE ("free_breakfast"); name ("Free Breakfast"); description; isVisible (1); sortOrder (10); createdAt; updatedAt.
- Indexes: unique code; index name; index isVisible.

Table: hotel

- Purpose: Master record for each hotel/property.
- Columns: id PK; name ("Raco Grand Resort"); slug UNIQUE ("raco-grand-resort"); description; email (info@racoresort.com); phone (+1-555-0199); addressLine1 (123 Ocean Ave); addressLine2 (Tower B); city (Miami); state (FL); postalCode (33101); countryCode (US); latitude (25.7617); longitude (-80.1918); timezone (America/New_York); starRating (5); checkInTime (15:00); checkOutTime (11:00); locationInfo JSON; isActive (1); createdAt; updatedAt.
- Indexes: name; slug UNIQUE; city; countryCode; isActive.

Table: hotel_amenity (junction)

- Purpose: Assign amenities to a hotel (many-to-many).
- Columns: hotelId FK->hotel; amenityId FK->amenity; createdAt.
- Constraint: PK (hotelId,amenityId).

Table: hotel_feature (junction)

- Purpose: Assign features to a hotel (many-to-many).
- Columns: hotelId FK->hotel; featureId FK->feature; createdAt.
- Constraint: PK (hotelId,featureId).

Table: hotel_image

- Purpose: Image gallery for hotels.
- Columns: id PK; hotelId FK->hotel; url; alt; sortOrder (1); createdAt.
- Indexes: hotelId.

Table: permission

- Purpose: Fine-grained capability keys (future RBAC granularity).
- Columns: id PK; key UNIQUE ("users.read"); description.
- Indexes: unique key; index key.

Table: role

- Purpose: Named roles for RBAC.
- Columns: id PK; name UNIQUE ("admin"); displayName ("Administrator").
- Indexes: unique name; index name.

Table: role_permission (junction)

- Purpose: Map roles to permissions.
- Columns: roleId; permissionId.
- Constraint: UNIQUE (roleId,permissionId).

Table: rate_plan

- Purpose: Marketable offers/rules; optional room-type specificity.
- Columns: id PK; hotelId FK->hotel; roomTypeId FK->room_type NULL; code ("BAR"); name ("Best Available Rate"); description; mealPlan ("Room Only"); minStay (1); maxStay (14); advancePurchaseDays (7); cancellationPolicyId FK->cancellation_policy NULL; isActive (1); createdAt; updatedAt.
- Indexes: UNIQUE (hotelId,code); hotelId; roomTypeId.

Table: room

- Purpose: Physical room units used for allocation/front desk.
- Columns: id PK; hotelId FK->hotel; roomTypeId FK->room_type RESTRICT; roomNumber ("1203A"); floor ("12"); description; status ("available"); isActive (1); createdAt; updatedAt.
- Indexes: hotelId; roomTypeId; status; UNIQUE (hotelId,roomNumber).

Table: room_inventory

- Purpose: Date-level sellable inventory per room type.
- Columns: roomTypeId FK->room_type; date ("2025-01-15"); availableRooms (8); overbookLimit (1); closed (0); updatedAt.
- Constraint: PK (roomTypeId,date). Index: date.

Table: room_rate

- Purpose: Date-level prices per room type and optional rate plan.
- Columns: roomTypeId FK->room_type; date ("2025-01-15"); ratePlanId FK->rate_plan NULL; priceCents (27900); currencyCode ("USD"); minStay (1); maxStay (14); closed (0); updatedAt.
- Constraint: PK (roomTypeId,date,ratePlanId). Indexes: date; priceCents.

Table: room_type

- Purpose: Sellable room categories for pricing/availability/bookings.
- Columns: id PK; hotelId FK->hotel; name ("Deluxe King Ocean View"); slug ("deluxe-king-ocean-view"); description; baseOccupancy (2); maxOccupancy (3); basePriceCents (24900); currencyCode ("USD"); sizeSqft (380); bedType ("King"); smokingAllowed (0); totalRooms (20); isActive (1); createdAt; updatedAt.
- Indexes: hotelId; basePriceCents; isActive; UNIQUE (hotelId,slug).

Table: room_type_amenity (junction)

- Purpose: Assign amenities to room types (many-to-many).
- Columns: roomTypeId FK->room_type; amenityId FK->amenity; createdAt.
- Constraint: PK (roomTypeId,amenityId).

Table: room_type_image

- Purpose: Image gallery for room types.
- Columns: id PK; roomTypeId FK->room_type; url; alt; sortOrder (1); createdAt.
- Indexes: roomTypeId.

Table: tax_fee

- Purpose: Hotel taxes/fees applied to bookings.
- Columns: id PK; hotelId FK->hotel; name ("City Tax"); type ("percent"); value (10); scope ("per_night"); includedInPrice (0); isActive (1); createdAt; updatedAt.
- Index: hotelId.

Table: promo_code

- Purpose: Discount codes with validity and limits.
- Columns: id PK; hotelId FK->hotel; code ("SUMMER25"); type ("percent"); value (25); startDate ("2025-06-01"); endDate ("2025-09-01"); minNights (2); minAmountCents (30000); maxDiscountCents (15000); usageLimit (1000); usageCount (12); isActive (1); createdAt; updatedAt.
- Indexes: UNIQUE (hotelId,code); isActive; (startDate,endDate).

Table: payment

- Purpose: Payments made for a booking.
- Columns: id PK; bookingId FK->booking; amountCents (78900); currencyCode ("USD"); status ("succeeded"); method ("card"); processor ("stripe"); processorPaymentId ("pi_3Nc..."); createdAt; updatedAt.
- Indexes: bookingId; status; UNIQUE (processor,processorPaymentId).

Table: refund

- Purpose: Refunds linked to payments.
- Columns: id PK; paymentId FK->payment; amountCents (10000); status ("succeeded"); processorRefundId ("re_1Qx..."); createdAt.
- Indexes: paymentId; UNIQUE processorRefundId.

Table: review

- Purpose: User-generated reviews tied to hotels and optionally users/bookings.
- Columns: id PK; hotelId FK->hotel; userId FK->user NULL; bookingId FK->booking NULL; rating (5); title ("Amazing stay!"); body ("Clean rooms..."); status ("published"); createdAt; publishedAt.
- Indexes: hotelId; status; rating.

Table: user

- Purpose: Admin users (and future guests/customers) with role/status.
- Columns: id PK; email UNIQUE ("admin@raco.dev"); passwordHash; fullName ("Ava Patel"); phone ("+44 7700 900123"); role ("admin"); status ("active"); createdAt; updatedAt.
- Indexes: unique+index on email; checks for role/status.

Table: cancellation_policy

- Purpose: Reusable cancellation rules per hotel.
- Columns: id PK; hotelId FK->hotel; name ("Flexible 24h"); description; freeCancelUntilHours (24); penaltyType ("nights"); penaltyValue (1); createdAt; updatedAt.
- Index: hotelId.

Indexing summary

- Hotels: `hotel.name`, `hotel.city`, `hotel.countryCode`, `hotel.isActive`
- Rooms: `room_type.hotelId`, `room_type.basePriceCents`, `room_type.isActive`; `room.roomTypeId`, `room.status`
- Availability/Pricing: `room_inventory.date`, `room_rate.date`, `room_rate.priceCents`
- Amenities/Features: `amenity.name`, `feature.name`, `feature.isVisible`
- Promotions/Taxes: `promo_code.isActive`, `(promo_code.startDate, promo_code.endDate)`, `tax_fee.hotelId`
- Bookings: `booking.hotelId`, `booking.userId`, `booking.status`, `(booking.checkInDate, booking.checkOutDate)`, `booking.totalAmountCents`
- Payments/Refunds: `payment.bookingId`, `payment.status`, unique `(processor, processorPaymentId)`; `refund.paymentId`, unique `refund.processorRefundId`
- Reviews: `review.hotelId`, `review.status`, `review.rating`
- Content: `content_block.page`, `content_block.section`, `content_block.hotelId`
