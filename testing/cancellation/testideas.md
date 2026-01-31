# Booking Cancellation Flow - Test Cases

## Overview
This document contains comprehensive test cases for the booking cancellation flow, including admin-initiated cancellations and public API (OTP-based) cancellations.

---

## 1. Public API Cancellation - OTP Request Flow

### 1.1 Valid Scenarios
- [ ] Request OTP with valid booking reference
- [ ] OTP email received at customer's registered email address
- [ ] OTP expires after 30 minutes
- [ ] OTP code is exactly 4 digits
- [ ] OTP stored in database with correct expiry timestamp
- [ ] Multiple bookings can request OTPs independently

### 1.2 Invalid Booking Reference
- [ ] Request OTP with non-existent booking reference → Returns 404
- [ ] Request OTP with empty booking reference → Returns 400
- [ ] Request OTP with invalid format booking reference → Returns 400
- [ ] Request OTP with SQL injection attempt in reference → Safely handled

### 1.3 Booking Status Validation
- [ ] Request OTP for already cancelled booking → Returns error
- [ ] Request OTP for checked-out booking → Returns error
- [ ] Request OTP for pending_cancellation booking → Should it allow or block?
- [ ] Request OTP for confirmed booking → Success
- [ ] Request OTP for checked-in booking → Success
- [ ] Request OTP for noshow booking → Should it allow or block?

### 1.4 Rate Limiting
- [ ] First OTP request → Success
- [ ] Second OTP request within 15 minutes → Success
- [ ] Third OTP request within 15 minutes → Success
- [ ] Fourth OTP request within 15 minutes → Returns 429 (rate limit)
- [ ] OTP request after 15 minutes from first request → Counter resets, success
- [ ] Rate limiting is per booking reference (not global)

### 1.5 Email Delivery
- [ ] Customer email exists in booking → Email sent successfully
- [ ] Customer email missing in booking → Returns error
- [ ] Invalid email format in booking → Returns error
- [ ] Email delivery failure → Returns appropriate error message
- [ ] OTP email lands in inbox (not spam)
- [ ] Email contains correct OTP code
- [ ] Email contains correct booking reference
- [ ] Email contains customer name

### 1.6 Edge Cases
- [ ] Request OTP for booking without customer record → Returns error
- [ ] Request OTP with very long booking reference → Handled gracefully
- [ ] Concurrent OTP requests for same booking → Only one succeeds or both create separate OTPs?
- [ ] Database connection failure during OTP creation → Returns error

---

## 2. Public API Cancellation - OTP Verification Flow

### 2.1 Valid OTP Verification - With Payment
- [ ] Verify with valid OTP and booking reference (has payment)
- [ ] Booking status changes to `pending_cancellation`
- [ ] Booking notes updated with "Customer requested cancellation via OTP"
- [ ] Used OTP deleted from database
- [ ] Response indicates status is `pending_cancellation`
- [ ] Response message indicates admin approval needed

### 2.2 Valid OTP Verification - Without Payment
- [ ] Verify with valid OTP and booking reference (no payment)
- [ ] Booking status changes directly to `cancelled`
- [ ] Cancellation reason stored
- [ ] Used OTP deleted from database
- [ ] Response indicates status is `cancelled`
- [ ] Response message indicates booking cancelled

### 2.3 Invalid OTP
- [ ] Verify with incorrect OTP code → Returns 400 "Invalid OTP"
- [ ] Verify with expired OTP (>30 minutes) → Returns 400 "Expired OTP"
- [ ] Verify with OTP that doesn't exist → Returns 400
- [ ] Verify with empty OTP → Returns 400
- [ ] Verify with non-numeric OTP → Returns 400
- [ ] Verify with OTP less than 4 digits → Returns 400
- [ ] Verify with OTP more than 4 digits → Returns 400

### 2.4 Booking State Validation
- [ ] Verify OTP for already cancelled booking → Returns 409 conflict
- [ ] Verify OTP for booking that was cancelled after OTP request → Handled gracefully
- [ ] Verify OTP for non-existent booking → Returns 404
- [ ] Verify OTP for booking reference that doesn't match OTP → Returns 400

### 2.5 OTP Reuse Prevention
- [ ] Use same OTP twice → Second attempt fails
- [ ] Request new OTP after first is used → New OTP works
- [ ] OTP from different booking → Doesn't work for wrong booking

### 2.6 Payment Detection Logic
- [ ] Booking with amountPaidCents = 0 → Cancels immediately
- [ ] Booking with amountPaidCents = null → Cancels immediately
- [ ] Booking with amountPaidCents > 0 → Sets pending_cancellation
- [ ] Booking with negative amountPaidCents (data error) → Handle gracefully

### 2.7 Edge Cases
- [ ] Verify OTP with mismatched booking reference → Returns error
- [ ] Verify after OTP expired → Returns appropriate error
- [ ] Concurrent verification attempts → Only one succeeds
- [ ] Database transaction failure → OTP not deleted, booking not updated
- [ ] Very large booking ID → Handled correctly

---

## 3. Admin Cancellation Flow - Direct Cancellation

### 3.1 Admin Cancels Booking with Razorpay Payment
- [ ] Open confirmed booking with Razorpay payment
- [ ] Click "Cancel Booking" button
- [ ] Modal opens showing total amount and amount paid
- [ ] Enter refund amount equal to amount paid
- [ ] Enter cancellation reason (optional)
- [ ] Submit → Razorpay refund API called
- [ ] Refund record created in database
- [ ] Booking status changes to `cancelled`
- [ ] cancelledAt timestamp set
- [ ] cancellationReason stored
- [ ] refundAmountCents stored
- [ ] Success message shown

### 3.2 Admin Cancels Booking with Manual Payment
- [ ] Open booking with manual/cash payment
- [ ] Click "Cancel Booking"
- [ ] Modal shows payment info
- [ ] Enter refund amount (if applicable)
- [ ] Submit → Booking cancelled (no Razorpay call)
- [ ] Status changes to `cancelled`
- [ ] No refund record created
- [ ] Success message shown

### 3.3 Admin Cancels Booking Without Payment
- [ ] Open booking with no payment (amountPaidCents = 0)
- [ ] Click "Cancel Booking"
- [ ] Modal shows "No Payment" alert
- [ ] No refund amount field shown
- [ ] Submit → Booking cancelled
- [ ] Success message indicates no refund processed

### 3.4 Refund Amount Validation
- [ ] Enter refund amount = amount paid → Success
- [ ] Enter refund amount < amount paid → Success (partial refund)
- [ ] Enter refund amount > amount paid → Error message shown
- [ ] Enter negative refund amount → Error message shown
- [ ] Enter 0 refund amount → Success (cancel without refund)
- [ ] Enter non-numeric refund amount → Validation error
- [ ] Enter refund with many decimal places → Rounded correctly
- [ ] Leave refund amount empty → Treated as 0 or error?

### 3.5 Modal Behavior
- [ ] Cancel button closes modal without changes
- [ ] Close (X) button closes modal without changes
- [ ] Loading state shown during submission
- [ ] Submit button disabled during loading
- [ ] Form fields disabled during loading
- [ ] Error message shown if submission fails
- [ ] Modal remains open on error for retry

### 3.6 Edge Cases
- [ ] Booking already cancelled by another admin → Error shown
- [ ] Razorpay API failure → Error shown, booking not cancelled
- [ ] Network timeout during submission → Appropriate error handling
- [ ] Very large refund amount within limits → Processed correctly
- [ ] Concurrent cancellation attempts → Only one succeeds

---

## 4. Admin Processing Pending Cancellations

### 4.1 Viewing Pending Cancellations
- [ ] Navigate to Pending Cancellations page (if route exists)
- [ ] OR filter bookings by status = "pending_cancellation"
- [ ] Pending cancellations shown with orange tag
- [ ] List shows: reference, customer, hotel, dates, amount paid
- [ ] "Process" or "Review" button visible

### 4.2 Opening Pending Cancellation Booking
- [ ] Click on pending_cancellation booking
- [ ] ViewBooking page opens
- [ ] Orange "PENDING_CANCELLATION" status tag shown
- [ ] Alert banner displays: "Cancellation Requested"
- [ ] Alert describes customer requested cancellation via OTP
- [ ] "Process Cancellation" button visible in actions menu

### 4.3 Processing Pending Cancellation - With Razorpay Payment
- [ ] Click "Process Cancellation"
- [ ] Modal opens with "Customer Cancellation Request" alert
- [ ] Refund amount pre-filled with amount paid
- [ ] Total amount shown correctly
- [ ] Amount paid shown correctly
- [ ] Admin can modify refund amount (within limits)
- [ ] Admin can add/edit cancellation reason
- [ ] Submit → Razorpay refund processed
- [ ] Booking status changes from pending_cancellation to cancelled
- [ ] Success message shown
- [ ] Page refreshes showing cancelled status

### 4.4 Processing Pending Cancellation - With Manual Payment
- [ ] Open pending_cancellation booking with manual payment
- [ ] Click "Process Cancellation"
- [ ] Modal shows payment info
- [ ] Admin enters refund amount (recorded but not processed)
- [ ] Submit → Booking status changes to cancelled
- [ ] No Razorpay API call made
- [ ] Success message shown

### 4.5 Validation During Processing
- [ ] Cannot enter refund > amount paid → Error
- [ ] Can enter refund < amount paid → Success (partial)
- [ ] Can enter 0 refund → Success (cancel without refund)
- [ ] Cannot process already cancelled booking → Error

### 4.6 Edge Cases
- [ ] Booking changed to cancelled by another admin while modal open → Error on submit
- [ ] Payment details changed after customer request → Use current data
- [ ] Very old pending_cancellation request → Still processable

---

## 5. Status Transitions and Business Logic

### 5.1 Valid Status Transitions
- [ ] confirmed → pending_cancellation (via public API with payment)
- [ ] confirmed → cancelled (via public API without payment)
- [ ] confirmed → cancelled (via admin)
- [ ] checkedin → pending_cancellation (via public API with payment)
- [ ] checkedin → cancelled (via public API without payment)
- [ ] checkedin → cancelled (via admin)
- [ ] pending_cancellation → cancelled (via admin processing)

### 5.2 Invalid Status Transitions
- [ ] cancelled → pending_cancellation (blocked)
- [ ] cancelled → confirmed (blocked)
- [ ] checkedout → cancelled (should be blocked?)
- [ ] noshow → cancelled (should be blocked?)
- [ ] pending_cancellation → confirmed (blocked)

### 5.3 Status Display
- [ ] confirmed → Green tag
- [ ] checkedin → Blue tag
- [ ] checkedout → Purple tag
- [ ] cancelled → Red tag
- [ ] noshow → Volcano tag
- [ ] pending_cancellation → Orange tag
- [ ] Status text formatted correctly (uppercase in UI)

---

## 6. Razorpay Integration

### 6.1 Successful Refund Processing
- [ ] Payment processor is "razorpay" → Refund API called
- [ ] Payment status is "succeeded" or "paid" → Refund allowed
- [ ] Refund amount validated against payment amount
- [ ] Razorpay refund ID returned and stored
- [ ] Refund status stored in database
- [ ] Payment status updated to "refunded" if fully refunded

### 6.2 Razorpay Validation
- [ ] Payment processor is NOT razorpay → Refund skipped (no error)
- [ ] Payment status is "pending" → Refund blocked
- [ ] Payment status is "failed" → Refund blocked
- [ ] Payment status is "refunded" → Already refunded error
- [ ] No processorPaymentId → Error shown

### 6.3 Razorpay API Errors
- [ ] Razorpay API returns 4xx error → Error message shown to admin
- [ ] Razorpay API returns 5xx error → Error message shown to admin
- [ ] Razorpay API timeout → Appropriate error handling
- [ ] Network error during Razorpay call → Booking not cancelled

### 6.4 Partial Refunds
- [ ] Refund amount < payment amount → Partial refund created
- [ ] Payment status remains as "paid" (not "refunded")
- [ ] Can process another partial refund later (if supported)
- [ ] Total refunds cannot exceed payment amount

### 6.5 Edge Cases
- [ ] Razorpay credentials missing → Error shown
- [ ] Invalid Razorpay credentials → Error shown
- [ ] Payment ID not found in Razorpay → Error shown
- [ ] Payment already refunded in Razorpay but not in our DB → Handle gracefully

---

## 7. Database and Data Integrity

### 7.1 Booking Record Updates
- [ ] cancelledAt timestamp set correctly
- [ ] cancellationReason stored (truncated to 500 chars if longer)
- [ ] refundAmountCents stored as integer
- [ ] status updated atomically
- [ ] updatedAt timestamp updated
- [ ] All fields persist correctly after cancellation

### 7.2 OTP Record Management
- [ ] OTP created with correct expiry time
- [ ] OTP associated with correct booking ID
- [ ] OTP deleted after successful verification
- [ ] OTP deleted after booking cancelled
- [ ] Expired OTPs can be cleaned up (maintenance script if exists)
- [ ] OTP records don't leak sensitive data

### 7.3 Payment and Refund Records
- [ ] Refund record created with correct payment ID
- [ ] Refund amount matches requested amount
- [ ] Refund status stored correctly
- [ ] Processor refund ID stored
- [ ] Payment status updated after full refund
- [ ] Timestamps set correctly

### 7.4 Transaction Integrity
- [ ] OTP verification and booking update happen atomically
- [ ] Refund creation and booking cancellation happen atomically
- [ ] Database rollback on error prevents partial state
- [ ] No orphaned OTP records after booking deletion

### 7.5 Edge Cases
- [ ] Database connection lost mid-transaction → Rolled back
- [ ] Very long cancellation reason → Truncated safely
- [ ] NULL values handled correctly
- [ ] Foreign key constraints respected

---

## 8. UI/UX Testing

### 8.1 Visual Elements
- [ ] Status tags display correct colors
- [ ] Alert banners show appropriate icons
- [ ] Modal layouts are responsive
- [ ] Form fields are properly aligned
- [ ] Loading spinners appear during async operations
- [ ] Error messages are clearly visible

### 8.2 User Feedback
- [ ] Success messages appear after successful actions
- [ ] Error messages are descriptive and actionable
- [ ] Loading states prevent double submissions
- [ ] Disabled states are visually clear
- [ ] Confirmation messages match the action taken

### 8.3 Form Validation Feedback
- [ ] Invalid input shows red border
- [ ] Validation messages appear below fields
- [ ] Required fields marked clearly
- [ ] Validation happens on blur and submit
- [ ] Clear indication of which field has error

### 8.4 Accessibility
- [ ] All buttons have accessible labels
- [ ] Form fields have proper labels
- [ ] Error messages associated with fields
- [ ] Keyboard navigation works correctly
- [ ] Screen reader announcements appropriate

### 8.5 Responsive Design
- [ ] Modal displays correctly on mobile
- [ ] Table columns adapt to screen size
- [ ] Buttons remain accessible on small screens
- [ ] Text doesn't overflow containers

---

## 9. Security Testing

### 9.1 OTP Security
- [ ] OTP not exposed in API responses
- [ ] OTP not logged in server logs
- [ ] OTP transmission uses HTTPS
- [ ] OTP cannot be guessed easily (4 digits, rate limited)
- [ ] Old OTPs cannot be reused

### 9.2 Authorization
- [ ] Public API endpoints don't require auth (by design)
- [ ] Admin cancellation endpoints require auth
- [ ] Cannot cancel another hotel's booking
- [ ] Cannot access OTP records via API

### 9.3 Input Validation
- [ ] SQL injection attempts blocked
- [ ] XSS attempts in cancellation reason sanitized
- [ ] Oversized inputs rejected
- [ ] Special characters handled safely
- [ ] Script tags in input stripped/escaped

### 9.4 Data Exposure
- [ ] Customer emails not exposed in public API
- [ ] Payment details not exposed unnecessarily
- [ ] Refund amounts only visible to admin
- [ ] Error messages don't leak system details

---

## 10. Performance and Scalability

### 10.1 Response Times
- [ ] OTP request responds within 2 seconds
- [ ] OTP verification responds within 1 second
- [ ] Admin cancellation responds within 3 seconds (with Razorpay)
- [ ] Pending cancellations page loads within 2 seconds

### 10.2 Database Performance
- [ ] Indexes on booking_reference used effectively
- [ ] Indexes on status used for pending queries
- [ ] OTP expiry index used for cleanup
- [ ] No N+1 queries in list views

### 10.3 Concurrent Operations
- [ ] Multiple OTP requests handled correctly
- [ ] Concurrent cancellation attempts handled safely
- [ ] Race conditions prevented with proper locking/transactions
- [ ] No deadlocks during concurrent operations

### 10.4 Rate Limiting Impact
- [ ] Rate limiting doesn't block legitimate requests
- [ ] Rate limit counters reset correctly
- [ ] Rate limiting is per-booking, not global
- [ ] Admin operations not affected by rate limiting

---

## 11. Email Notifications

### 11.1 OTP Email Content
- [ ] Subject line clear and relevant
- [ ] OTP code prominently displayed
- [ ] Booking reference included
- [ ] Customer name personalized
- [ ] Expiry time mentioned (30 minutes)
- [ ] Warning about ignoring if not requested
- [ ] Company branding/logo present

### 11.2 Email Deliverability
- [ ] Emails not flagged as spam
- [ ] Emails arrive within 1 minute
- [ ] Email formatting correct in major clients (Gmail, Outlook, Apple Mail)
- [ ] Links (if any) work correctly
- [ ] Plain text fallback provided

### 11.3 Edge Cases
- [ ] Email service temporarily down → Appropriate error
- [ ] Invalid email address → Error caught before sending
- [ ] Malformed email template → Fallback template used

---

## 12. Monitoring and Logging

### 12.1 Logging Coverage
- [ ] OTP requests logged with booking reference
- [ ] OTP verifications logged (success/failure)
- [ ] Cancellation actions logged with admin ID
- [ ] Refund requests logged with amounts
- [ ] Errors logged with stack traces
- [ ] No sensitive data (OTP codes, full payment details) in logs

### 12.2 Audit Trail
- [ ] Who cancelled the booking (admin or customer via OTP)
- [ ] When cancellation happened
- [ ] Why cancellation happened (reason field)
- [ ] How much refunded
- [ ] Status change history traceable

### 12.3 Error Monitoring
- [ ] Failed OTP deliveries tracked
- [ ] Failed Razorpay calls tracked
- [ ] Database errors logged
- [ ] Rate limit violations tracked

---

## 13. Integration Points

### 13.1 Razorpay Integration
- [ ] Credentials loaded from environment
- [ ] API client initialized correctly
- [ ] Refund requests formatted correctly
- [ ] Response parsing works correctly
- [ ] Error responses handled gracefully

### 13.2 Email Service Integration
- [ ] Email service credentials configured
- [ ] Email templates rendered correctly
- [ ] Email delivery confirmed
- [ ] Bounce handling (if applicable)

### 13.3 Frontend-Backend Integration
- [ ] API endpoints match frontend calls
- [ ] Request/response formats match
- [ ] Error codes understood by frontend
- [ ] Loading states synchronized

---

## 14. Migration and Backwards Compatibility

### 14.1 Database Migration
- [ ] Migration script runs without errors
- [ ] New columns added successfully
- [ ] Existing data not corrupted
- [ ] Indexes created successfully
- [ ] Migration can be rolled back if needed

### 14.2 Existing Bookings
- [ ] Old cancelled bookings (without new fields) display correctly
- [ ] Old cancelled bookings don't break queries
- [ ] NULL values in new fields handled correctly
- [ ] Status enum includes old and new values

### 14.3 API Compatibility
- [ ] Old API clients still work
- [ ] New response fields don't break old clients
- [ ] Version compatibility maintained

---

## 15. Edge Cases and Error Scenarios

### 15.1 Boundary Conditions
- [ ] Refund amount = 0 → Handled correctly
- [ ] Refund amount = MAX_SAFE_INTEGER → Validation blocks
- [ ] Very old bookings (years ago) → Can still be cancelled
- [ ] Booking created but never confirmed → Handle appropriately

### 15.2 System Failures
- [ ] Database down during OTP request → Error returned
- [ ] Database down during verification → Error returned
- [ ] Redis/cache down (if used) → System still works
- [ ] Email service down → Graceful error message

### 15.3 Data Inconsistencies
- [ ] Booking has payment record but amountPaidCents = 0 → Handle gracefully
- [ ] Payment record missing but amountPaidCents > 0 → Handle gracefully
- [ ] OTP exists but booking doesn't → Cleaned up safely
- [ ] Multiple payment records for one booking → Use correct one

### 15.4 User Behavior Edge Cases
- [ ] User refreshes page during submission → No duplicate processing
- [ ] User opens multiple tabs and cancels from both → Only one succeeds
- [ ] User leaves modal open for hours then submits → Validation still works
- [ ] User closes browser during cancellation → State remains consistent

---

## 16. Cleanup and Maintenance

### 16.1 OTP Cleanup
- [ ] Expired OTPs can be queried
- [ ] Cleanup script/job exists or planned
- [ ] Cleanup doesn't affect active OTPs
- [ ] Cleanup runs without blocking operations

### 16.2 Orphaned Records
- [ ] No orphaned OTP records after booking deletion
- [ ] Cascade deletes work correctly
- [ ] Foreign key constraints enforced

---

## Testing Checklist Summary

**Total Test Cases**: Count as you complete them

**Priority Levels**:
- 🔴 Critical: Must pass before production
- 🟡 Important: Should pass, investigate failures
- 🟢 Nice-to-have: Good to verify, not blocking

**Testing Phases**:
1. ✅ Unit testing (individual functions)
2. ✅ Integration testing (component interactions)
3. ✅ End-to-end testing (full user flows)
4. ✅ Manual testing (UI/UX verification)
5. ✅ Performance testing (load and stress)
6. ✅ Security testing (vulnerability checks)

---

## Notes Section

**Issues Found**:
- 

**Questions for Development Team**:
- 

**Follow-up Actions**:
- 

**Test Environment Details**:
- Backend URL:
- Frontend URL:
- Database: 
- Test Razorpay Credentials:
- Test Email Account:

---

**Last Updated**: [Date]
**Tested By**: [Name]
**Version/Commit**: [Git commit hash or version number]
