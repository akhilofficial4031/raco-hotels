import { ApiTags, createRoute } from "../lib/route-wrapper";
import {
  CreateDraftBookingRequestSchema,
  DraftBookingResponseSchema,
  BookingPathParamsSchema,
  ProcessPaymentRequestSchema,
  BookingResponseSchema,
  ConfirmBookingRequestSchema,
  ConfirmBookingFromDraftRequestSchema,
  BookingConfirmationResponseSchema,
  BookingFeedbackRequestSchema,
  PendingBookingsQuerySchema,
  PendingBookingsResponseSchema,
} from "../schemas";

export const BookingRouteDefinitions = {
  createDraft: createRoute({
    method: "post",
    path: "/booking/draft",
    summary: "Create draft booking",
    description: `Create or update a draft booking for room reservation.

**User Types:** All (Guest, Logged-in Users, Staff, Admin)

**Authentication:** Smart auth (conditional based on user type)

**Behavior by User Type:**
- **Guest Users** (sessionId provided, no auth): Saves to booking_draft table for session management
- **Logged-in Users**: Saves to booking table with userId for account association

**Use Cases:**
- Guest browsing and selecting rooms without signup
- Logged-in user starting their booking process
- Updating booking details before final confirmation
- Building shopping cart functionality

**Important Notes:**
- For guest users, always include sessionId to track their booking across page reloads
- This endpoint validates room availability and calculates pricing with taxes/fees
- Draft bookings don't affect room inventory until confirmed
- Supports promo codes for discount calculations

**Frontend Integration:**
- Use this for room selection and booking details form
- Store sessionId in browser storage for guest users
- Handle both authenticated and guest flows seamlessly`,
    tags: [ApiTags.BOOKINGS],
    successSchema: DraftBookingResponseSchema,
    successDescription:
      "Draft booking created successfully with booking ID and reference code",
    requestSchema: CreateDraftBookingRequestSchema,
    includeBadRequest: true,
  }),

  processPayment: createRoute({
    method: "post",
    path: "/booking/{id}/payment",
    summary: "Process payment for existing booking",
    description: `Process payment for an existing booking and update payment status.

**User Types:** Staff, Admin (Authentication Required)

**Authentication:** Required - User must be logged in with appropriate permissions

**Permission Required:** bookings.update

**Use Cases:**
- Staff processing guest payment at front desk
- Adding partial payments to existing bookings
- Processing payment for reserved bookings
- Handling payment retries for failed transactions

**Behavior:**
- Creates payment record in the system
- Updates booking balance due amount
- Currently implements mock payment processing
- Supports multiple payment methods (card, cash, UPI, etc.)
- Tracks payment processor information

**Important Notes:**
- This endpoint works with existing bookings only
- Payment amount cannot exceed the outstanding balance
- Multiple partial payments are supported
- Payment status is tracked separately from booking status

**Frontend Integration:**
- Use for staff payment processing interfaces
- Implement payment method selection UI
- Show remaining balance after payment
- Handle payment success/failure states`,
    tags: [ApiTags.BOOKINGS],
    successSchema: BookingResponseSchema,
    successDescription:
      "Payment processed successfully, booking balance updated",
    paramsSchema: BookingPathParamsSchema,
    requestSchema: ProcessPaymentRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
  }),

  confirm: createRoute({
    method: "post",
    path: "/booking/{id}/confirm",
    summary: "Confirm existing booking",
    description: `Confirm an existing booking and change status to confirmed.

**User Types:** Staff, Admin (Authentication Required)

**Authentication:** Required - User must be logged in with appropriate permissions

**Permission Required:** bookings.update

**Use Cases:**
- Confirming reserved booking after payment verification
- Manual confirmation by staff for special cases
- Finalizing bookings that were held pending approval
- Converting reserved status to confirmed status

**Behavior:**
- Changes booking status from 'reserved' to 'confirmed'
- Sends confirmation notifications (if enabled)
- Triggers post-confirmation workflows
- Does not affect payment or inventory (should be handled separately)

**Important Notes:**
- This endpoint works with existing bookings only
- Booking must be in 'reserved' status to be confirmed
- Does not process payments - use processPayment endpoint first
- Does not update inventory - inventory should be managed during reservation

**Frontend Integration:**
- Use for staff confirmation interfaces
- Show booking details before confirmation
- Handle confirmation success notifications
- Update booking status in UI after confirmation

**Typical Flow:**
1. Create booking (reserved status)
2. Process payment (if required)
3. Confirm booking (this endpoint)`,
    tags: [ApiTags.BOOKINGS],
    successSchema: BookingResponseSchema,
    successDescription:
      "Booking confirmed successfully, status updated to confirmed",
    paramsSchema: BookingPathParamsSchema,
    requestSchema: ConfirmBookingRequestSchema,
    includeNotFound: true,
  }),

  feedback: createRoute({
    method: "post",
    path: "/booking/{id}/feedback",
    summary: "Submit post-stay feedback",
    description: `Submit guest feedback and rating for a completed booking.

**User Types:** All Authenticated Users (Guest, Staff, Admin)

**Authentication:** Required - User must be logged in

**Permission Required:** bookings.update

**Use Cases:**
- Guest submitting review after checkout
- Post-stay feedback collection
- Hotel service quality assessment
- Rating and review system

**Behavior:**
- Records guest feedback and rating (1-5 stars)
- Updates booking with review information
- Stores optional title and detailed comments
- Links feedback to specific booking for tracking

**Important Notes:**
- Feedback can only be submitted for completed bookings
- Rating is required (1-5 scale), title and comments are optional
- One feedback per booking (subsequent calls update existing feedback)
- Feedback is typically submitted after checkout

**Frontend Integration:**
- Use for post-stay feedback forms
- Implement star rating component (1-5 stars)
- Include optional title and comment fields
- Show feedback form only for completed bookings
- Handle feedback submission success states

**Best Practices:**
- Trigger feedback request after checkout
- Send follow-up emails with feedback links
- Display feedback in booking history
- Use for service improvement analytics`,
    tags: [ApiTags.BOOKINGS],
    successSchema: BookingResponseSchema,
    successDescription: "Feedback submitted successfully and linked to booking",
    paramsSchema: BookingPathParamsSchema,
    requestSchema: BookingFeedbackRequestSchema,
    includeNotFound: true,
  }),

  convertDraft: createRoute({
    method: "post",
    path: "/booking/convert-draft",
    summary: "Convert guest draft to user booking",
    description: `Convert a guest session draft to an authenticated user's booking.

**User Types:** Logged-in Users Only (Authentication Required)

**Authentication:** Required - User must be logged in

**Permission Required:** bookings.create

**Use Cases:**
- User logs in after creating guest draft booking
- User signs up and wants to claim their session draft
- Converting anonymous shopping cart to user account
- Preserving booking progress through authentication flow

**Behavior:**
- Finds existing draft by sessionId or email
- Creates new booking record with authenticated userId
- Copies all draft details (dates, room, pricing, etc.)
- Deletes original guest draft
- Sets booking status to 'reserved' (not confirmed)
- Does NOT affect room inventory (still a draft/reserved status)

**Important Notes:**
- Does NOT complete the booking - only transfers ownership
- Booking remains in 'reserved' status after conversion
- Use this before payment/confirmation flow
- Original draft must exist and be valid
- Cannot convert already converted or expired drafts

**Frontend Integration:**
- Call this API immediately after user login/signup
- Use sessionId from guest browsing session
- Handle cases where draft might not exist
- Continue to payment flow after successful conversion
- Store returned booking ID for subsequent operations

**Typical User Journey:**
1. Guest creates draft (with sessionId)
2. Guest decides to login/signup
3. Call convertDraft with sessionId
4. Continue with payment/confirmation flow

**Error Handling:**
- Draft not found: Guest session expired or invalid
- Already converted: Draft was already processed
- Authentication required: User must be logged in`,
    tags: [ApiTags.BOOKINGS],
    successSchema: BookingResponseSchema,
    successDescription:
      "Draft converted successfully to user booking with reserved status",
    includeBadRequest: true,
  }),

  confirmFromDraft: createRoute({
    method: "post",
    path: "/booking/confirm-from-draft",
    summary: "Complete booking process from draft",
    description: `Complete the entire booking process from a guest session draft with full validation and inventory management.

**User Types:** All (Guest, Logged-in Users, Staff, Admin)

**Authentication:** Smart auth (conditional based on context)

**Permission Required:** bookings.create

**Use Cases:**
- Guest completing checkout without signup (one-step booking)
- Staff creating booking for walk-in guest at front desk
- Admin creating booking via back office
- Phone booking by staff for guest
- Email booking conversion

**Behavior:**
- Validates guest information (name, email, phone)
- Processes and validates promo codes with usage limits
- Validates room inventory availability for all dates
- **Updates room inventory** (decrements available rooms)
- Creates confirmed booking with status 'confirmed'
- Creates payment records if prepaid
- Supports multiple booking sources (web, front_office, phone, email, mobile_app)
- Deletes original draft after successful confirmation
- Handles comprehensive error scenarios

**Important Notes:**
- This is a COMPLETE booking process - creates final confirmed booking
- Actually impacts room inventory (books the room)
- Supports both prepaid and pay-later scenarios
- Requires complete guest contact information
- Promo codes are validated and usage counts updated
- Different behavior based on user context (guest vs staff)

**Frontend Integration:**
- Use for final checkout/confirmation step
- Collect all required guest information
- Implement payment method selection
- Handle booking source based on user type
- Show comprehensive booking confirmation
- Handle inventory unavailability gracefully

**User Type Specific Behavior:**
- **Guest Users**: source defaults to 'web', creates anonymous booking
- **Logged-in Users**: associates booking with userId
- **Staff/Admin**: source defaults to 'front_office', enhanced tracking

**Required Fields:**
- sessionId (to find the draft)
- contactEmail (guest email)
- guestName (primary guest name)
- Optional: contactPhone, userId, payment details

**Error Handling:**
- Draft not found or expired
- Guest information incomplete
- Room inventory insufficient
- Promo code invalid or expired
- Payment processing failures`,
    tags: [ApiTags.BOOKINGS],
    successSchema: BookingConfirmationResponseSchema,
    successDescription:
      "Booking confirmed successfully with full details and confirmation code",
    requestSchema: ConfirmBookingFromDraftRequestSchema,
    includeBadRequest: true,
    includeNotFound: true,
  }),

  getPendingBookings: createRoute({
    method: "get",
    path: "/booking/pending",
    summary: "Get abandoned booking drafts",
    description: `Retrieve pending/abandoned booking drafts for admin follow-up and cart recovery campaigns.

**User Types:** Staff, Admin Only (Authentication Required)

**Authentication:** Required - User must be logged in with appropriate permissions

**Permission Required:** bookings.read

**Use Cases:**
- Admin dashboard for abandoned cart analytics
- Follow-up campaigns for incomplete bookings
- Recovery emails for potential guests
- Business intelligence on booking funnel
- Staff follow-up on incomplete reservations

**Behavior:**
- Fetches all draft bookings that haven't been converted/confirmed
- Supports comprehensive filtering options
- Includes pagination for large datasets
- Enriches data with hotel and room type names
- Calculates derived fields (days since created, expiration status)
- Shows drafts older than specified timeframes
- Supports sorting by various criteria

**Query Parameters:**
- **page**: Page number for pagination (default: 1)
- **limit**: Items per page (default: 20, max: 100)
- **hotelId**: Filter by specific hotel
- **olderThan**: Show drafts older than date (YYYY-MM-DD)
- **checkInAfter**: Filter by check-in date range
- **checkInBefore**: Filter by check-in date range
- **sortBy**: Sort field (created_at, check_in_date, total_amount)
- **sortOrder**: Sort direction (asc, desc)

**Response Data:**
- Booking draft details with hotel/room type names
- Contact information (if provided)
- Pricing and promotional information
- Creation and update timestamps
- Calculated fields: daysSinceCreated, isExpiringSoon

**Frontend Integration:**
- Build admin dashboard with filtering controls
- Implement pagination controls
- Show abandoned cart metrics
- Provide contact information for follow-up
- Display booking value and potential revenue
- Enable bulk actions (email campaigns, deletion)

**Business Intelligence:**
- Track conversion rates by time periods
- Identify popular room types in abandonment
- Monitor seasonal abandonment patterns
- Calculate potential revenue recovery

**Important Notes:**
- Only shows draft status bookings (not confirmed)
- Includes guest contact information for follow-up
- Supports date range filtering for targeted campaigns
- Performance optimized with pagination
- Access restricted to staff/admin for privacy`,
    tags: [ApiTags.BOOKINGS],
    successSchema: PendingBookingsResponseSchema,
    successDescription:
      "Pending bookings retrieved successfully with pagination and filters applied",
    querySchema: PendingBookingsQuerySchema,
    includeBadRequest: true,
  }),
};
