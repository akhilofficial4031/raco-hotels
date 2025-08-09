## Database schema and rationale (Drizzle ORM on Cloudflare D1)

### Goals and context

- Admin app manages: hotels, rooms, amenities, features, content, promo codes, users, bookings, and payments.
- Backed by Cloudflare D1 (SQLite). Schema is defined with Drizzle ORM and split into modular files under `backend/drizzle/schema/*` and aggregated by `backend/drizzle/schema/index.ts`.
- Focus on: correctness (constraints), performance (indexes on search/sort columns), simplicity, and clear evolution paths.

### Design principles

- Normalization where it improves consistency and query performance; denormalize sparingly.
- Monetary amounts stored as integer cents to avoid floating point rounding errors.
- Booleans represented as integers (0/1) for D1/SQLite compatibility.
- Soft-enums validated via `CHECK` constraints where applicable.
- All rows carry timestamps (`createdAt`, `updatedAt` where meaningful) for auditability.
- Searchable/sortable UI fields have indexes for responsive admin lists.
- Foreign keys use `onDelete`/`onUpdate` strategies that reflect business needs (e.g., cascade for child rows, restrict where deletion should be blocked).

---

### 1) Hotels

Table: `hotel`

- Purpose: Master record for each hotel; used across rooms, content, features, amenities, bookings, taxes, promotions.
- Columns:
  - `id` (PK): Surrogate key for joins.
  - `name` (TEXT, required): Display name; heavily used in search/sort.
  - `slug` (TEXT, unique): URL-safe identifier for SEO and stable linking. Nullable initially to avoid breaking existing rows; can be enforced NOT NULL later.
  - `description` (TEXT): Marketing copy.
  - `email`, `phone` (TEXT): Contact info for communications.
  - `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `countryCode` (TEXT): Structured address to support filtering and location services.
  - `latitude`, `longitude` (REAL): Map display, geo-based features.
  - `timezone` (TEXT): Needed to compute local times for check-in/out, pricing windows.
  - `starRating` (INTEGER, CHECK 1..5): Hotel rating for sorting and display.
  - `checkInTime`, `checkOutTime` (TEXT): Policy defaults.
  - `isActive` (0/1, default 1): Soft visibility flag; prevents hard deletion.
  - `createdAt`, `updatedAt` (TEXT): Audit fields.
- Indexes:
  - `name` (search/sort), `slug` unique, `city`, `countryCode` (filters), `isActive` (listing toggles).

Table: `hotel_image`

- Purpose: Gallery images for a hotel.
- Columns: `id`, `hotelId` (FK->hotel), `url`, `alt` (a11y/SEO), `sortOrder`, `createdAt`.
- Indexes: `hotelId` for quick retrieval of a hotel's images.

Why: Hotel is the top-level entity and central to most flows. Images are separated to allow multiple items and ordering without bloating the main row.

---

### 2) Features (hotel-level)

Tables: `feature`, `hotel_feature`

- Purpose: Site/admin-managed features attached to hotels (different from room amenities). E.g., "Free breakfast", "Ocean view" at hotel level, and used for content discovery.
- `feature` Columns:
  - `id` (PK)
  - `code` (unique): Stable identifier for programmatic use.
  - `name` (required): Display name.
  - `description` (TEXT): Longer description for tooltips or docs.
  - `isVisible` (0/1, default 1): Admin toggle to hide/show in UI.
  - `sortOrder` (INTEGER): Controls display ordering.
  - `createdAt`, `updatedAt`.
- `hotel_feature` Columns:
  - Composite PK `(hotelId, featureId)` to prevent duplicates.
  - `hotelId` (FK->hotel), `featureId` (FK->feature), `createdAt`.
- Indexes: `feature.name` (search), `feature.isVisible` (filters).

Why: Decoupling the feature catalog from hotel assignment supports reuse, visibility toggles, and consistent naming.

---

### 3) Amenities (room-level)

Tables: `amenity`, `hotel_amenity`, `room_type_amenity`

- Purpose: Amenity catalog and assignments at both hotel and room level.
- `amenity` Columns: `id`, `code` (unique), `name` (required), `icon`, `createdAt`, `updatedAt`.
- `hotel_amenity` Columns: PK `(hotelId, amenityId)`, `createdAt`.
- `room_type_amenity` Columns: PK `(roomTypeId, amenityId)`, `createdAt`.
- Indexes: `amenity.name`.

Why: Many-to-many relationships keep the catalog flexible and prevent duplication.

---

### 4) Room types and media

Tables: `room_type`, `room_type_image`

- Purpose: Define distinct sellable room categories and related imagery.
- `room_type` Columns:
  - `id` (PK)
  - `hotelId` (FK->hotel): Rooms belong to a hotel.
  - `name` (required), `slug` (unique per hotel): For display and deep links.
  - `description` (TEXT)
  - `baseOccupancy`, `maxOccupancy` (INTEGER): Used by pricing and booking rules. CHECK: `maxOccupancy >= baseOccupancy`.
  - `basePriceCents` (INTEGER >= 0), `currencyCode`: Default price for display/fallbacks.
  - `sizeSqft` (INTEGER), `bedType` (TEXT), `smokingAllowed` (0/1), `totalRooms` (INTEGER): Operational details.
  - `isActive` (0/1): Visibility.
  - `createdAt`, `updatedAt`.
- `room_type_image` Columns: `id`, `roomTypeId`, `url`, `alt`, `sortOrder`, `createdAt`.
- Indexes: `room_type.hotelId`, `room_type.basePriceCents`, `room_type.isActive`; `room_type_image.roomTypeId`.

Why: Rate/availability are modeled separately per day to keep room type immutable metadata clean.

---

### 5) Policies and rate plans

Tables: `cancellation_policy`, `rate_plan`

- Purpose: Encapsulate rate rules and cancellation terms.
- `cancellation_policy` Columns: `id`, `hotelId`, `name`, `description`, `freeCancelUntilHours`, `penaltyType` (percent|nights|fixed), `penaltyValue`, `createdAt`, `updatedAt`.
- `rate_plan` Columns: `id`, `hotelId`, `roomTypeId?` (nullable to allow hotel-wide plans), `code` (unique per hotel), `name`, `description`, `mealPlan`, `minStay`, `maxStay`, `advancePurchaseDays`, `cancellationPolicyId?`, `isActive`, `createdAt`, `updatedAt`.
- Indexes: `cancellation_policy.hotelId`; `rate_plan.hotelId`, `rate_plan.roomTypeId`.

Why: Separating policies and plans allows reuse across room types and cleaner change management.

---

### 6) Availability and pricing per day

Tables: `room_inventory`, `room_rate`

- Purpose: Manage sellable inventory and nightly pricing by date.
- `room_inventory` Columns:
  - PK `(roomTypeId, date)`: Natural uniqueness per day.
  - `availableRooms`, `overbookLimit` (>=0), `closed` (0/1), `updatedAt`.
  - Index: `date` for calendar queries.
- `room_rate` Columns:
  - PK `(roomTypeId, date, ratePlanId)` to support multiple plans per day.
  - `priceCents` (>=0), `currencyCode`, `minStay`, `maxStay`, `closed` (0/1), `updatedAt`.
  - Indexes: `date`, `priceCents`.

Why: This structure supports calendar UI, bulk updates, and fast availability queries without scanning bookings.

---

### 7) Taxes and promotions

Tables: `tax_fee`, `promo_code`

- Purpose: Apply statutory and property fees; support discounting.
- `tax_fee` Columns: `id`, `hotelId`, `name`, `type` (percent|fixed), `value`, `scope` (per_stay|per_night|per_person), `includedInPrice` (0/1), `isActive`, `createdAt`, `updatedAt`.
- `promo_code` Columns: `id`, `hotelId`, `code` (unique per hotel), `type` (percent|fixed), `value`, `startDate`, `endDate`, `minNights`, `minAmountCents`, `maxDiscountCents`, `usageLimit`, `usageCount`, `isActive`, `createdAt`, `updatedAt`.
- Indexes: `tax_fee.hotelId`; `promo_code.isActive`, `(startDate, endDate)`.

Why: Keeps pricing modifiers maintainable and auditable.

---

### 8) Users

Table: `user`

- Purpose: Admin users (and optionally guests/customers in future extensions) with RBAC-ready attributes.
- Columns:
  - `id` (PK)
  - `email` (unique, required): Login identifier and lookup.
  - `passwordHash` (TEXT): Credential storage (hashed via app layer).
  - `fullName`, `phone`: Display and contact.
  - `role` (guest|staff|admin via CHECK): Authorization primitive.
  - `status` (active|disabled via CHECK): Soft deactivation without deletion.
  - `createdAt`, `updatedAt`.
- Indexes: `email` unique + index.

Why: Minimal columns to enable auth, status control, and role-based UI gating.

---

### 9) Bookings and charges

Tables: `booking`, `booking_item`, `booking_promotion`, `payment`, `refund`

- Purpose: Capture reservations, nightly breakdown, applied promotions, and financial transactions.
- `booking` Columns:
  - `id` (PK)
  - `referenceCode` (unique): Human-friendly reference for support and reconciliation.
  - `hotelId` (FK->hotel), `userId?` (FK->user): Context and ownership.
  - `status` (reserved|confirmed|checked_in|checked_out|cancelled|no_show via CHECK in app layer): Lifecycle control.
  - `source` (web|phone|ota): Reporting.
  - `checkInDate`, `checkOutDate` (TEXT YYYY-MM-DD): Search filters and capacity planning.
  - `numAdults`, `numChildren` (INTEGER): Occupancy.
  - Totals: `totalAmountCents`, `currencyCode`, `taxAmountCents`, `feeAmountCents`, `discountAmountCents`, `balanceDueCents`.
  - Cancellation metadata: `cancelledAt`, `cancellationReason`.
  - `createdAt`, `updatedAt`.
  - Indexes: `hotelId`, `userId`, `status`, `(checkInDate, checkOutDate)`, `totalAmountCents`.
- `booking_item` Columns:
  - `id` (PK)
  - `bookingId` (FK), `roomTypeId` (FK), `ratePlanId?` (FK): Line item linkage.
  - `date` (stay night), `priceCents`, `taxAmountCents`, `feeAmountCents`.
  - Unique `(bookingId, roomTypeId, date)` to prevent duplicates.
  - Indexes: `bookingId`, `date`.
- `booking_promotion` Columns: PK `(bookingId, promoCodeId)`, `amountCents`, `createdAt`.
- `payment` Columns:
  - `id` (PK), `bookingId` (FK), `amountCents`, `currencyCode`.
  - `status` (pending|succeeded|failed|refunded|partially_refunded), `method` (card|upi|netbanking|cash|wallet), `processor` (stripe|razorpay|cash|manual...), `processorPaymentId` (unique per processor), timestamps.
  - Indexes: `bookingId`, `status`, unique `(processor, processorPaymentId)`.
- `refund` Columns: `id` (PK), `paymentId` (FK), `amountCents`, `status`, `processorRefundId` (unique), `createdAt`.
  - Indexes: `paymentId`, unique `processorRefundId`.

Why: Line-item granularity enables analytics, per-night adjustments, and accurate tax/fee allocation. Separate payments support multi-capture, refunds, and reconciliation.

---

### 10) Reviews

Table: `review`

- Purpose: Optional UGC for hotels, linked to user and booking when available to prevent spam and enable verification.
- Columns: `id`, `hotelId`, `userId?`, `bookingId?`, `rating` (1..5 via CHECK), `title`, `body`, `status` (pending|published|rejected), `createdAt`, `publishedAt`.
- Indexes: `hotelId`, `status`, `rating`.

Why: Supports moderation and display filtering.

---

### 11) Audit log

Table: `audit_log`

- Purpose: Minimal immutable audit trail for admin actions and mutation events.
- Columns: `id`, `actorUserId?`, `entityType`, `entityId`, `action` (create|update|delete|status_change), `oldValue`, `newValue`, `createdAt`.
- Indexes: `(entityType, entityId)`, `actorUserId`, `action`.

Why: Traceability and compliance; helps diagnose operational issues.

---

### 12) Content blocks (CMS)

Table: `content_block`

- Purpose: Editable homepage/about sections with media and ordering; supports hotel-scoped sections and global sections.
- Columns: `id`, `hotelId?` (nullable for global), `page` (home|about|...), `section` (hero|banner|featured|...), `title`, `body` (Markdown/HTML), `mediaUrl`, `sortOrder`, `isVisible`, `createdAt`, `updatedAt`.
- Indexes: `page`, `section`, `hotelId`.

Why: Simple CMS to satisfy the content management requirement without introducing a separate service.

---

### Indexing strategy summary (searchable/sortable)

- Hotel lists: `hotel.name`, `hotel.city`, `hotel.countryCode`, `hotel.isActive`.
- Room lists: `room_type.hotelId`, `room_type.basePriceCents`, `room_type.isActive`.
- Amenities/features: `amenity.name`, `feature.name`, `feature.isVisible`.
- Promotions: `promo_code.isActive`, `(promo_code.startDate, promo_code.endDate)`.
- Bookings: `booking.hotelId`, `booking.userId`, `booking.status`, `(booking.checkInDate, booking.checkOutDate)`, `booking.totalAmountCents`.
- Payments: `payment.bookingId`, `payment.status`, unique `(processor, processorPaymentId)`.
- Reviews: `review.hotelId`, `review.status`, `review.rating`.
- Content: `content_block.page`, `content_block.section`, `content_block.hotelId`.

### Why this structure

- Clear separation between metadata (hotel, room_type) and time-variant data (room_inventory, room_rate) enables fast calendar and pricing operations and easier bulk updates.
- Many-to-many tables (`hotel_feature`, `hotel_amenity`, `room_type_amenity`, `booking_promotion`) enforce uniqueness and simplify assignments.
- Financial rigor: prices/amounts in cents, promotion limits, and unique external IDs for payments/refunds ease reconciliation.
- Operational safety: `isActive` toggles and `status` fields minimize hard deletes; FKs with appropriate `onDelete` semantics prevent orphaned data.
- Performance: indexes mirror admin UI filters and sorts described in the requirements.

### File locations

- Schema modules: `backend/drizzle/schema/*.ts`
- Aggregator for Drizzle: `backend/drizzle/schema/index.ts`
- App re-export shim: `backend/drizzle/schema.ts`

### Migrations and local apply

- Generate SQL migrations from schema: `yarn --cwd backend db:generate`
- Apply to local D1: `yarn --cwd backend db:migrate:apply`
- Migration folder: `backend/drizzle/migrations` (configured in Drizzle and Wrangler)

### Future considerations

- Enforce `hotel.slug` NOT NULL after backfill.
- Add dedicated RBAC tables if permissions become more granular (roles, permissions, role_assignment).
- Add webhook logs for payment processors and idempotency keys if integrating external gateways.
- Add composite indexes if/when new, expensive filters are introduced in the UI analytics.
