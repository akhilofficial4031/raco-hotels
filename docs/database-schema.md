## Database schema and rationale (Drizzle ORM on Cloudflare D1)

This document explains what each table is intended for and why each column exists, aligned with the current Drizzle schema under `backend/drizzle/schema/*` (aggregated by `backend/drizzle/schema/index.ts`) and the project scope described in `frontend/.cursor/rules/010-project-requirement-description.mdc`.

## Principles and conventions

- **Storage**: Cloudflare D1 (SQLite) with Drizzle ORM.
- **Money**: Stored as integer cents to avoid floating-point issues.
- **Booleans**: Stored as integers 0/1 for SQLite compatibility.
- **Soft enums**: Validated with checks in schema or in the application layer.
- **Timestamps**: Most tables include `createdAt` and `updatedAt` for auditability.
- **Indexes**: Added for common filters/sorts used in the admin UI.
- **FK semantics**: `onDelete`/`onUpdate` reflect business needs (cascade where dependent data must go, restrict to protect important references, set null for optional relations).
- **JSON text**: Some display-only, free-form fields use JSON text columns.

## 1) Hotels and media

Table: `hotel` (file: `backend/drizzle/schema/hotel.ts`)

- Purpose: Master record for each hotel (central join point across the system).
- Columns:
  - `id` INTEGER PK AUTOINCREMENT: Surrogate key.
  - `name` TEXT NOT NULL: Display/search name.
  - `slug` TEXT NULL, unique: SEO-friendly identifier; nullable to allow staged rollout.
  - `description` TEXT NULL: Marketing description.
  - `email` TEXT NULL, `phone` TEXT NULL: Contact details.
  - `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `countryCode` TEXT: Structured address for filtering and location info.
  - `latitude`, `longitude` REAL: Map display/proximity features.
  - `timezone` TEXT: Localize check-in/out and pricing windows.
  - `starRating` INTEGER NULL: 1–5; protected by a check constraint.
  - `checkInTime`, `checkOutTime` TEXT: Property defaults.
  - `locationInfo` TEXT(JSON) NULL: Optional JSON for nearby points of interest; display-only.
  - `isActive` INTEGER NOT NULL DEFAULT 1: Visibility toggle.
  - `createdAt`, `updatedAt` TEXT NOT NULL DEFAULT `CURRENT_TIMESTAMP`.
- Indexes: `name`, unique `slug`, `city`, `countryCode`, `isActive`.

Table: `hotel_image` (file: `backend/drizzle/schema/hotel_image.ts`)

- Purpose: Gallery images for a hotel.
- Columns: `id`, `hotelId` FK->`hotel` (cascade), `url`, `alt`, `sortOrder`, `createdAt`.
- Indexes: `hotelId`.

## 2) Features (hotel-level)

Tables: `feature`, `hotel_feature` (files: `feature.ts`, `hotel_feature.ts`)

- Purpose: Catalog of hotel-level features and the many-to-many mapping to hotels.
- `feature` columns:
  - `id` PK, `code` TEXT unique (programmatic key), `name` TEXT, `description` TEXT, `isVisible` 0/1, `sortOrder` INT, timestamps.
  - Indexes: unique `code`, `name`, `isVisible`.
- `hotel_feature` columns:
  - `hotelId` FK->`hotel` (cascade), `featureId` FK->`feature` (cascade), `createdAt`.
  - PK: composite (`hotelId`, `featureId`).

## 3) Amenities (catalog + assignments)

Tables: `amenity`, `hotel_amenity`, `room_type_amenity` (files: `amenity.ts`, `hotel_amenity.ts`, `room_type_amenity.ts`)

- Purpose: Shared amenity catalog and relationships to hotels and room types.
- `amenity` columns: `id`, `code` unique, `name` NOT NULL, `icon` optional, timestamps. Indexes: unique `code`, `name`.
- `hotel_amenity` columns: composite PK (`hotelId`, `amenityId`), `createdAt`.
- `room_type_amenity` columns: composite PK (`roomTypeId`, `amenityId`), `createdAt`.

## 4) Room catalog and media

Tables: `room_type`, `room_type_image`, `room` (files: `room_type.ts`, `room_type_image.ts`, `room_unit.ts`)

- Purpose: Define sellable categories (`room_type`), related images, and physical room units (`room`).
- `room_type` columns:
  - `id` PK, `hotelId` FK->`hotel` (cascade), `name` NOT NULL, `slug` NOT NULL (unique per hotel), `description` TEXT,
    `baseOccupancy` INT >= 1, `maxOccupancy` INT with check `max >= base`,
    `basePriceCents` INT >= 0, `currencyCode` TEXT, `sizeSqft` INT, `bedType` TEXT,
    `smokingAllowed` 0/1, `totalRooms` INT, `isActive` 0/1, timestamps.
  - Indexes: `hotelId`, `basePriceCents`, `isActive`; unique (`hotelId`, `slug`).
- `room_type_image` columns: `id`, `roomTypeId` FK->`room_type` (cascade), `url`, `alt`, `sortOrder`, `createdAt`. Index: `roomTypeId`.
- `room` columns:
  - Physical units for allocation/frontdesk. `id`, `hotelId` FK->`hotel` (cascade), `roomTypeId` FK->`room_type` (restrict delete),
    `roomNumber` TEXT NOT NULL, `floor` TEXT, `description` TEXT, `status` TEXT (available|occupied|maintenance|out_of_order), `isActive` 0/1, timestamps.
  - Indexes: `hotelId`, `roomTypeId`, `status`; unique (`hotelId`, `roomNumber`).

## 5) Policies and rate plans

Tables: `cancellation_policy`, `rate_plan` (files: `policy_rate.ts`, `rate_plan.ts`)

- Purpose: Reusable cancellation rules and rate plans.
- `cancellation_policy` columns: `id`, `hotelId` FK->`hotel` (cascade), `name`, `description`, `freeCancelUntilHours` INT, `penaltyType` TEXT, `penaltyValue` INT, timestamps. Index: `hotelId`.
- `rate_plan` columns: `id`, `hotelId` FK->`hotel` (cascade), `roomTypeId` nullable FK->`room_type` (set null), `code` unique per hotel, `name`, `description`, `mealPlan`, `minStay`, `maxStay`, `advancePurchaseDays`, `cancellationPolicyId` nullable FK->`cancellation_policy` (set null), `isActive` 0/1, timestamps. Indexes: unique (`hotelId`, `code`), `hotelId`, `roomTypeId`.

## 6) Availability and nightly pricing

Tables: `room_inventory`, `room_rate` (files: `inventory_rate.ts`, `room_rate.ts`)

- Purpose: Date-granular sellable inventory and nightly prices.
- `room_inventory` columns: composite PK (`roomTypeId`, `date`), `availableRooms` INT >= 0, `overbookLimit` INT >= 0, `closed` 0/1, `updatedAt`. Index: `date`.
- `room_rate` columns: composite PK (`roomTypeId`, `date`, `ratePlanId`), `ratePlanId` nullable FK->`rate_plan` (set null), `priceCents` INT >= 0, `currencyCode`, `minStay`, `maxStay`, `closed` 0/1, `updatedAt`. Indexes: `date`, `priceCents`.

## 7) Taxes and promotions

Tables: `tax_fee`, `promo_code` (files: `tax_promo.ts`, `promo_code.ts`)

- Purpose: Apply statutory/property fees and promotional discounts.
- `tax_fee` columns: `id`, `hotelId` FK->`hotel` (cascade), `name`, `type` TEXT (percent|fixed), `value` INT (percent 0..100 or cents), `scope` TEXT (per_stay|per_night|per_person), `includedInPrice` 0/1, `isActive` 0/1, timestamps. Index: `hotelId`.
- `promo_code` columns: `id`, `hotelId` FK->`hotel` (cascade), `code` unique per hotel, `type` TEXT (percent|fixed), `value` INT, `startDate`, `endDate`, `minNights`, `minAmountCents`, `maxDiscountCents`, `usageLimit`, `usageCount`, `isActive` 0/1, timestamps. Indexes: unique (`hotelId`, `code`), `isActive`, `(startDate, endDate)`.

## 8) Users and RBAC

Tables: `user`, `role`, `permission`, `role_permission` (files: `user.ts`, `permission.ts`, `role_permission.ts`)

- Purpose: Admin users and coarse RBAC primitives.
- `user` columns: `id`, `email` unique NOT NULL, `passwordHash` TEXT, `fullName` TEXT, `phone` TEXT, `role` TEXT (guest|staff|admin), `status` TEXT (active|disabled), timestamps. Indexes: unique+index on `email`, checks for `role` and `status` values.
- `role` columns: `id`, `name` unique (e.g., admin, staff, guest), `displayName` TEXT, indexes on `name`.
- `permission` columns: `id`, `key` unique (e.g., users.read), `description` TEXT, indexes on `key`.
- `role_permission` columns: unique (`roleId`, `permissionId`) to map roles to permissions.

Note: Current app logic primarily uses the `user.role` soft-enum; `role`/`permission` tables exist for future granular RBAC.

## 9) Booking lifecycle and transactions

Tables: `booking`, `booking_item`, `booking_promotion`, `payment`, `refund` (files: `booking.ts`, `booking_item.ts`, `booking_promotion.ts`, `payment.ts`, `refund.ts`)

- Purpose: Capture reservations, nightly line items, applied promos, and financial transactions.
- `booking` columns: `id`, `referenceCode` unique, `hotelId` FK->`hotel` (restrict), `userId` nullable FK->`user` (set null), `status` (reserved|confirmed|checked_in|checked_out|cancelled|no_show), `source` (web|phone|ota), dates, occupancy counts, totals (`totalAmountCents`, `currencyCode`, `taxAmountCents`, `feeAmountCents`, `discountAmountCents`, `balanceDueCents`), `notes`, cancellation metadata, timestamps. Indexes: `hotelId`, `userId`, `status`, `(checkInDate, checkOutDate)`, `totalAmountCents`.
- `booking_item` columns: `id`, `bookingId` FK->`booking` (cascade), `roomTypeId` FK->`room_type` (restrict), `ratePlanId` nullable FK->`rate_plan` (set null), `date`, `priceCents`, `taxAmountCents`, `feeAmountCents`, `createdAt`. Unique: (`bookingId`, `roomTypeId`, `date`). Indexes: `bookingId`, `date`.
- `booking_promotion` columns: `bookingId` FK->`booking` (cascade), `promoCodeId` FK->`promo_code` (restrict), `amountCents`, `createdAt`.
- `payment` columns: `id`, `bookingId` FK->`booking` (cascade), `amountCents`, `currencyCode`, `status`, `method`, `processor`, `processorPaymentId` (unique per processor), timestamps. Indexes: `bookingId`, `status`, unique (`processor`, `processorPaymentId`).
- `refund` columns: `id`, `paymentId` FK->`payment` (cascade), `amountCents`, `status`, `processorRefundId` unique, `createdAt`. Indexes: `paymentId`, unique `processorRefundId`.

## 10) Draft bookings (guest flow)

Tables: `booking_draft`, `booking_draft_item` (files: `booking_draft.ts`, `booking_draft_item.ts`)

- Purpose: Persist unauthenticated guest cart/draft data during the booking flow.
- `booking_draft` columns: `id`, `sessionId` unique, `referenceCode`, `hotelId` (restrict), `roomTypeId` (restrict), `ratePlanId` nullable (set null), `status` (draft), `checkInDate`, `checkOutDate`, occupancy, amounts (`baseAmountCents`, `taxAmountCents`, `feeAmountCents`, `discountAmountCents`, `totalAmountCents`, `balanceDueCents`), `currencyCode`, contact (`promoCode`, `contactEmail`, `contactPhone`), `addOnsJson` TEXT, timestamps. Indexes: unique `sessionId`, `hotelId`, `(checkInDate, checkOutDate)`.
- `booking_draft_item` columns: `id`, `bookingDraftId` FK->`booking_draft` (cascade), `date`, `priceCents`, `taxAmountCents`, `feeAmountCents`, `createdAt`. Index: `date`.

## 11) Reviews

Table: `review` (file: `review.ts`)

- Purpose: Optional UGC tied to hotels and optionally users/bookings.
- Columns: `id`, `hotelId` FK->`hotel` (cascade), `userId` nullable FK->`user` (set null), `bookingId` nullable FK->`booking` (set null), `rating` 1..5 with check, `title`, `body`, `status` (pending|published|rejected), `createdAt`, `publishedAt`. Indexes: `hotelId`, `status`, `rating`.

## 12) Content blocks (CMS)

Table: `content_block` (file: `content.ts`)

- Purpose: Simple CMS for homepage/about sections (optionally hotel-scoped).
- Columns: `id`, `hotelId` nullable FK->`hotel` (set null), `page` TEXT, `section` TEXT, `title`, `body` (Markdown/HTML), `mediaUrl`, `sortOrder`, `isVisible` 0/1, timestamps. Indexes: `page`, `section`, `hotelId`.

## 13) Audit log

Table: `audit_log` (file: `audit.ts`)

- Purpose: Immutable log of admin actions or data changes.
- Columns: `id`, `actorUserId` nullable FK->`user` (set null), `entityType` TEXT, `entityId` INT, `action` TEXT (create|update|delete|status_change), `oldValue` TEXT, `newValue` TEXT, `createdAt`. Indexes: `(entityType, entityId)`, `actorUserId`, `action`.

## Indexing strategy summary

- Hotels: `hotel.name`, `hotel.city`, `hotel.countryCode`, `hotel.isActive`.
- Rooms: `room_type.hotelId`, `room_type.basePriceCents`, `room_type.isActive`; `room.roomTypeId`, `room.status`.
- Amenities/features: `amenity.name`, `feature.name`, `feature.isVisible`.
- Promotions/taxes: `promo_code.isActive`, `(promo_code.startDate, promo_code.endDate)`, `tax_fee.hotelId`.
- Bookings: `booking.hotelId`, `booking.userId`, `booking.status`, `(booking.checkInDate, booking.checkOutDate)`, `booking.totalAmountCents`.
- Payments/refunds: `payment.bookingId`, `payment.status`, unique (`processor`, `processorPaymentId`); `refund.paymentId`, unique `refund.processorRefundId`.
- Reviews: `review.hotelId`, `review.status`, `review.rating`.
- Content: `content_block.page`, `content_block.section`, `content_block.hotelId`.
- Availability/pricing: `room_inventory.date`, `room_rate.date`, `room_rate.priceCents`.

## File locations

- Schema modules: `backend/drizzle/schema/*.ts`
- Aggregator: `backend/drizzle/schema/index.ts`
- App re-export shim: `backend/drizzle/schema.ts`

## Migrations and local usage

- Generate SQL from schema: `yarn --cwd backend db:generate`
- Apply locally: `yarn --cwd backend db:migrate:apply`
- Migration directory: `backend/drizzle/migrations` (wired in `drizzle.config.ts` and `wrangler.toml`).

## Rationale highlights

- Separation between relatively static metadata (e.g., `hotel`, `room_type`) and time-variant data (`room_inventory`, `room_rate`) keeps writes efficient and queries predictable.
- Many-to-many maps (`hotel_feature`, `hotel_amenity`, `room_type_amenity`, `booking_promotion`) enforce uniqueness and maintain clean relationships.
- Financial rigor through integer cents and unique processor IDs eases reconciliation and avoids rounding errors.
- Operational safety via `isActive` flags, status columns, and FK `onDelete` policies to prevent orphaned data.
