import { ApiTags, createRoute } from "../lib/route-wrapper";
import {
  CreateCustomerRequestSchema,
  UpdateCustomerRequestSchema,
  CustomerPathParamsSchema,
  CustomerSearchQuerySchema,
  FindCustomerByEmailQuerySchema,
  CustomerResponseSchema,
  CustomerWithStatsResponseSchema,
  CustomersListResponseSchema,
  CustomerBookingHistoryResponseSchema,
  FindCustomerByEmailResponseSchema,
} from "../schemas";

export const CustomerRouteDefinitions = {
  create: createRoute({
    method: "post",
    path: "/customers",
    summary: "Create new customer",
    description: `Create a new customer record for hotel bookings.

**User Types:** Staff, Admin

**Authentication:** Required

**Permission Required:** customers.create

**Use Cases:**
- Front desk staff creating customer profile during check-in
- Admin creating customer records
- Pre-registration of VIP guests
- Bulk customer data import

**Behavior:**
- Validates email uniqueness across all customers
- Validates phone number format if provided
- Validates date of birth (age 13-120 years)
- Sets default status as 'active'
- Records creation source (web, front_office, etc.)
- Converts preference arrays to JSON storage format

**Important Notes:**
- Email must be unique in the system
- Phone numbers are validated for basic format
- Date of birth must be in YYYY-MM-DD format
- Dietary preferences and special requests are stored as JSON arrays
- Marketing opt-in defaults to false (0)

**Frontend Integration:**
- Use for customer registration forms
- Implement email validation with duplicate checking
- Provide dropdowns for gender, nationality, ID types
- Support multiple dietary preferences selection
- Handle address fields appropriately by country`,
    tags: ["Customers"],
    requestSchema: CreateCustomerRequestSchema,
    successSchema: CustomerResponseSchema,
    successDescription: "Customer created successfully",
    includeBadRequest: true,
  }),

  getById: createRoute({
    method: "get",
    path: "/customers/{id}",
    summary: "Get customer by ID",
    description: `Retrieve detailed customer information by ID.

**User Types:** Staff, Admin

**Authentication:** Required

**Permission Required:** customers.read

**Use Cases:**
- View customer profile during booking process
- Customer service inquiries
- Account management
- Booking history review

**Response Data:**
- Complete customer profile information
- All contact details and preferences
- System metadata (creation date, last update)
- Does not include booking statistics (use /customers/{id}/stats for that)

**Frontend Integration:**
- Use for customer detail pages
- Display in booking forms for existing customers
- Show in customer search results`,
    tags: ["Customers"],
    pathParamsSchema: CustomerPathParamsSchema,
    successSchema: CustomerResponseSchema,
    successDescription: "Customer retrieved successfully",
    includeNotFound: true,
  }),

  update: createRoute({
    method: "put",
    path: "/customers/{id}",
    summary: "Update customer information",
    description: `Update existing customer information.

**User Types:** Staff, Admin

**Authentication:** Required

**Permission Required:** customers.update

**Use Cases:**
- Customer updating their profile information
- Staff correcting customer details
- Adding missing information after booking
- Updating preferences and contact information

**Behavior:**
- Validates email uniqueness if email is being changed
- Validates phone numbers and date of birth if provided
- Updates only provided fields (partial update)
- Maintains creation timestamp, updates modification timestamp
- Preserves booking history and statistics

**Important Notes:**
- Email uniqueness is enforced across all customers
- Cannot change customer ID or creation timestamp
- Status changes should be handled carefully (active/inactive/blocked)
- Preference arrays are converted to JSON for storage

**Frontend Integration:**
- Use for customer edit forms
- Implement field-level validation
- Show confirmation for status changes
- Handle partial updates appropriately`,
    tags: ["Customers"],
    pathParamsSchema: CustomerPathParamsSchema,
    requestSchema: UpdateCustomerRequestSchema,
    successSchema: CustomerResponseSchema,
    successDescription: "Customer updated successfully",
    includeBadRequest: true,
    includeNotFound: true,
  }),

  delete: createRoute({
    method: "delete",
    path: "/customers/{id}",
    summary: "Delete customer (soft delete)",
    description: `Soft delete a customer by setting status to inactive.

**User Types:** Admin

**Authentication:** Required

**Permission Required:** customers.delete

**Use Cases:**
- Remove inactive customer accounts
- Handle data privacy requests
- Clean up duplicate or test accounts
- Deactivate problematic accounts

**Behavior:**
- Performs soft delete by setting status to 'inactive'
- Preserves all customer data and booking history
- Customer can be reactivated by updating status to 'active'
- Does not affect existing bookings or references

**Important Notes:**
- This is a soft delete - data is preserved
- Booking history remains intact
- Customer cannot make new bookings while inactive
- Can be reversed by updating status

**Frontend Integration:**
- Show confirmation dialog before deletion
- Explain that this is a soft delete
- Provide option to reactivate customers
- Update UI to reflect inactive status`,
    tags: ["Customers"],
    pathParamsSchema: CustomerPathParamsSchema,
    successSchema: { message: "string" },
    successDescription: "Customer deleted successfully",
    includeNotFound: true,
  }),

  search: createRoute({
    method: "get",
    path: "/customers",
    summary: "Search customers with filters",
    description: `Search and filter customers with pagination.

**User Types:** Staff, Admin

**Authentication:** Required

**Permission Required:** customers.read

**Query Parameters:**
- **email**: Partial email search (case-insensitive)
- **fullName**: Partial name search (case-insensitive)
- **phone**: Search in both primary and alternate phone numbers
- **status**: Filter by customer status (active, inactive, blocked)
- **source**: Filter by registration source (web, front_office, phone, etc.)
- **createdAfter/createdBefore**: Date range filters (YYYY-MM-DD format)
- **hasBookings**: Filter customers with/without booking history
- **page/limit**: Pagination (default: page=1, limit=20, max=100)
- **sortBy**: Sort field (id, fullName, email, createdAt, lastBookingAt)
- **sortOrder**: Sort direction (asc, desc, default: desc)

**Response Data:**
- Paginated customer list with booking statistics
- Total booking count and spent amount per customer
- Last booking date for each customer
- Comprehensive pagination metadata

**Use Cases:**
- Customer search in booking interface
- Admin customer management
- Marketing list generation
- Customer service inquiries
- Reporting and analytics

**Frontend Integration:**
- Implement search with debounced input
- Provide filter dropdowns and date pickers
- Show booking statistics in results
- Handle pagination appropriately
- Export functionality for marketing`,
    tags: ["Customers"],
    queryParamsSchema: CustomerSearchQuerySchema,
    successSchema: CustomersListResponseSchema,
    successDescription: "Customers retrieved successfully",
  }),

  getBookingHistory: createRoute({
    method: "get",
    path: "/customers/{id}/bookings",
    summary: "Get customer booking history",
    description: `Retrieve complete booking history for a customer.

**User Types:** Staff, Admin

**Authentication:** Required

**Permission Required:** customers.read, bookings.read

**Response Data:**
- Complete list of customer bookings (all statuses)
- Hotel names, dates, amounts, and status for each booking
- Total booking count and lifetime spending
- Bookings sorted by creation date (newest first)

**Use Cases:**
- Customer service inquiries
- Booking pattern analysis
- Loyalty program management
- Dispute resolution
- Customer relationship management

**Frontend Integration:**
- Display in customer profile pages
- Show booking timeline
- Link to individual booking details
- Calculate customer lifetime value
- Identify booking patterns and preferences`,
    tags: ["Customers"],
    pathParamsSchema: CustomerPathParamsSchema,
    successSchema: CustomerBookingHistoryResponseSchema,
    successDescription: "Customer booking history retrieved successfully",
    includeNotFound: true,
  }),

  getStats: createRoute({
    method: "get",
    path: "/customers/{id}/stats",
    summary: "Get customer statistics and insights",
    description: `Get comprehensive customer statistics and behavioral insights.

**User Types:** Staff, Admin

**Authentication:** Required

**Permission Required:** customers.read

**Response Data:**
- Complete customer profile information
- Total bookings and lifetime spending
- Average booking value
- Last booking date and frequency analysis
- Preferred hotels (top 3 most booked)
- Booking frequency classification (frequent/regular/occasional/never)

**Calculated Metrics:**
- **averageBookingValue**: Total spent ÷ total bookings
- **bookingFrequency**: Based on bookings per month ratio
  - frequent: ≥1 booking per month
  - regular: ≥0.25 bookings per month (quarterly)
  - occasional: <0.25 bookings per month
  - never: no bookings
- **preferredHotels**: Hotels ranked by booking count

**Use Cases:**
- Customer relationship management
- Personalized service delivery
- Marketing campaign targeting
- Loyalty program tier assignment
- Revenue analysis and forecasting

**Frontend Integration:**
- Display in customer dashboard
- Use for personalized recommendations
- Show insights in customer service interface
- Generate customer reports
- Support loyalty program features`,
    tags: ["Customers"],
    pathParamsSchema: CustomerPathParamsSchema,
    successDescription: "Customer statistics retrieved successfully",
    includeNotFound: true,
  }),

  findByEmail: createRoute({
    method: "get",
    path: "/customers/find-by-email",
    summary: "Find customer by email address",
    description: `Find existing customer by email address with optional booking data.

**User Types:** Staff, Admin

**Authentication:** Required

**Permission Required:** customers.read

**Query Parameters:**
- **email**: Customer email address (required)
- **includeBookingData**: Include booking statistics (optional, default: false)

**Use Cases:**
- Quick customer lookup during booking process
- Email-based customer identification
- Duplicate customer prevention
- Customer service inquiries
- Pre-fill booking forms with existing customer data

**Response Data:**
- Customer profile if found, null if not found
- Boolean 'found' flag for easy checking
- Optional booking statistics if requested
- Appropriate message based on result

**Frontend Integration:**
- Use during booking flow to check existing customers
- Implement email-based customer search
- Pre-populate forms with customer data
- Handle new vs returning customer flows
- Show customer booking history when relevant`,
    tags: ["Customers"],
    queryParamsSchema: FindCustomerByEmailQuerySchema,
    successSchema: FindCustomerByEmailResponseSchema,
    successDescription: "Customer search completed",
  }),

  findOrCreate: createRoute({
    method: "post",
    path: "/customers/find-or-create",
    summary: "Find existing customer or create new one",
    description: `Find customer by email or create new customer record if not found.

**User Types:** Staff, Admin

**Authentication:** Required

**Permission Required:** customers.read, customers.create

**Use Cases:**
- Streamlined booking process for walk-in guests
- Quick customer registration during booking
- Phone booking by staff
- Email booking processing
- Front desk check-in process

**Behavior:**
- First attempts to find customer by email
- If found, updates last booking timestamp and returns existing customer
- If not found, creates new customer with provided data
- Returns customer data along with isNew flag
- Validates all customer data if creating new record

**Response Data:**
- Customer profile (existing or newly created)
- Boolean 'isNew' flag indicating if customer was created
- Appropriate success message based on action taken

**Important Notes:**
- Updates lastBookingAt timestamp for existing customers
- Performs full validation for new customer creation
- Email uniqueness is guaranteed by find-first logic
- Useful for booking flows where customer status is unknown

**Frontend Integration:**
- Use in booking checkout process
- Handle both new and returning customer scenarios
- Show appropriate messages based on isNew flag
- Streamline booking form completion
- Reduce friction in booking process`,
    tags: ["Customers"],
    requestSchema: CreateCustomerRequestSchema,
    successDescription: "Customer found or created successfully",
    includeBadRequest: true,
  }),
};
