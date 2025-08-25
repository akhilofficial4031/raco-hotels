import { CustomerRepository } from "../repositories/customer.repository";

import type {
  CreateCustomerData,
  UpdateCustomerData,
  CustomerSearchFilters,
  DatabaseCustomer,
  CustomerWithBookingStats,
  CustomerBookingHistory,
} from "../types";

export class CustomerService {
  /**
   * Create a new customer
   * Validates email uniqueness and processes data before creation
   */
  static async createCustomer(
    db: D1Database,
    data: CreateCustomerData,
  ): Promise<DatabaseCustomer> {
    // Check if customer with this email already exists
    const existingCustomer = await CustomerRepository.findByEmail(
      db,
      data.email,
    );
    if (existingCustomer) {
      throw new Error("customer.emailAlreadyExists");
    }

    // Validate phone numbers if provided
    if (data.phone && !this.isValidPhoneNumber(data.phone)) {
      throw new Error("customer.invalidPhoneNumber");
    }
    if (data.alternatePhone && !this.isValidPhoneNumber(data.alternatePhone)) {
      throw new Error("customer.invalidAlternatePhoneNumber");
    }

    // Validate date of birth if provided
    if (data.dateOfBirth && !this.isValidDateOfBirth(data.dateOfBirth)) {
      throw new Error("customer.invalidDateOfBirth");
    }

    // Create the customer
    return await CustomerRepository.create(db, data);
  }

  /**
   * Get customer by ID
   */
  static async getCustomerById(
    db: D1Database,
    id: number,
  ): Promise<DatabaseCustomer | null> {
    return await CustomerRepository.findById(db, id);
  }

  /**
   * Get customer by email
   * Useful for checking existing customers during booking process
   */
  static async getCustomerByEmail(
    db: D1Database,
    email: string,
    includeStats = false,
  ): Promise<DatabaseCustomer | CustomerWithBookingStats | null> {
    const customer = await CustomerRepository.findByEmail(db, email);
    if (!customer || !includeStats) {
      return customer;
    }

    // Get booking stats
    const bookingHistory = await CustomerRepository.getBookingHistory(
      db,
      customer.id,
    );
    if (!bookingHistory) {
      return customer;
    }

    return {
      ...customer,
      totalBookings: bookingHistory.totalBookings,
      totalSpentCents: bookingHistory.totalSpentCents,
      lastBookingAt: bookingHistory.bookings[0]?.createdAt || null,
    };
  }

  /**
   * Update customer information
   */
  static async updateCustomer(
    db: D1Database,
    data: UpdateCustomerData,
  ): Promise<DatabaseCustomer> {
    // Check if customer exists
    const existingCustomer = await CustomerRepository.findById(db, data.id);
    if (!existingCustomer) {
      throw new Error("customer.notFound");
    }

    // If email is being updated, check for uniqueness
    if (data.email && data.email !== existingCustomer.email) {
      const emailExists = await CustomerRepository.findByEmail(db, data.email);
      if (emailExists && emailExists.id !== data.id) {
        throw new Error("customer.emailAlreadyExists");
      }
    }

    // Validate phone numbers if provided
    if (data.phone && !this.isValidPhoneNumber(data.phone)) {
      throw new Error("customer.invalidPhoneNumber");
    }
    if (data.alternatePhone && !this.isValidPhoneNumber(data.alternatePhone)) {
      throw new Error("customer.invalidAlternatePhoneNumber");
    }

    // Validate date of birth if provided
    if (data.dateOfBirth && !this.isValidDateOfBirth(data.dateOfBirth)) {
      throw new Error("customer.invalidDateOfBirth");
    }

    const updated = await CustomerRepository.update(db, data);
    if (!updated) {
      throw new Error("customer.updateFailed");
    }

    return updated;
  }

  /**
   * Delete customer (soft delete)
   */
  static async deleteCustomer(db: D1Database, id: number): Promise<void> {
    const customer = await CustomerRepository.findById(db, id);
    if (!customer) {
      throw new Error("customer.notFound");
    }

    const deleted = await CustomerRepository.delete(db, id);
    if (!deleted) {
      throw new Error("customer.deleteFailed");
    }
  }

  /**
   * Search customers with filters and pagination
   */
  static async searchCustomers(db: D1Database, filters: CustomerSearchFilters) {
    // Validate pagination parameters
    if (filters.page && filters.page < 1) {
      throw new Error("customer.invalidPage");
    }
    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      throw new Error("customer.invalidLimit");
    }

    // Validate date filters
    if (filters.createdAfter && !this.isValidDate(filters.createdAfter)) {
      throw new Error("customer.invalidCreatedAfterDate");
    }
    if (filters.createdBefore && !this.isValidDate(filters.createdBefore)) {
      throw new Error("customer.invalidCreatedBeforeDate");
    }

    return await CustomerRepository.search(db, filters);
  }

  /**
   * Get customer booking history
   */
  static async getCustomerBookingHistory(
    db: D1Database,
    customerId: number,
  ): Promise<CustomerBookingHistory> {
    const customer = await CustomerRepository.findById(db, customerId);
    if (!customer) {
      throw new Error("customer.notFound");
    }

    const history = await CustomerRepository.getBookingHistory(db, customerId);
    if (!history) {
      // Return empty history if customer exists but has no bookings
      return {
        customerId,
        bookings: [],
        totalBookings: 0,
        totalSpentCents: 0,
      };
    }

    return history;
  }

  /**
   * Find or create customer by email
   * Useful during booking process when customer might already exist
   */
  static async findOrCreateCustomer(
    db: D1Database,
    customerData: CreateCustomerData,
  ): Promise<{ customer: DatabaseCustomer; isNew: boolean }> {
    // Try to find existing customer by email
    const existingCustomer = await CustomerRepository.findByEmail(
      db,
      customerData.email,
    );

    if (existingCustomer) {
      // Update last booking timestamp and return existing customer
      await CustomerRepository.updateLastBookingAt(db, existingCustomer.id);
      return { customer: existingCustomer, isNew: false };
    }

    // Create new customer
    const newCustomer = await this.createCustomer(db, customerData);
    return { customer: newCustomer, isNew: true };
  }

  /**
   * Update customer's last booking timestamp
   * Called when a customer makes a new booking
   */
  static async updateLastBookingTimestamp(
    db: D1Database,
    customerId: number,
    timestamp?: string,
  ): Promise<void> {
    const customer = await CustomerRepository.findById(db, customerId);
    if (!customer) {
      throw new Error("customer.notFound");
    }

    await CustomerRepository.updateLastBookingAt(db, customerId, timestamp);
  }

  /**
   * Get customer statistics
   * Useful for admin dashboard and customer insights
   */
  static async getCustomerStats(db: D1Database, customerId: number) {
    const customer = await CustomerRepository.findById(db, customerId);
    if (!customer) {
      throw new Error("customer.notFound");
    }

    const bookingHistory = await CustomerRepository.getBookingHistory(
      db,
      customerId,
    );

    if (!bookingHistory) {
      return {
        customer,
        totalBookings: 0,
        totalSpentCents: 0,
        averageBookingValue: 0,
        lastBookingAt: null,
        bookingFrequency: "never",
        preferredHotels: [],
      };
    }

    const averageBookingValue =
      bookingHistory.totalBookings > 0
        ? Math.round(
            bookingHistory.totalSpentCents / bookingHistory.totalBookings,
          )
        : 0;

    // Calculate booking frequency
    let bookingFrequency = "never";
    if (bookingHistory.totalBookings > 0) {
      const daysSinceFirstBooking = this.getDaysBetweenDates(
        bookingHistory.bookings[bookingHistory.bookings.length - 1].createdAt,
        new Date().toISOString(),
      );
      const bookingsPerMonth =
        (bookingHistory.totalBookings / daysSinceFirstBooking) * 30;

      if (bookingsPerMonth >= 1) bookingFrequency = "frequent";
      else if (bookingsPerMonth >= 0.25) bookingFrequency = "regular";
      else bookingFrequency = "occasional";
    }

    // Get preferred hotels (most booked)
    const hotelCounts = bookingHistory.bookings.reduce(
      (acc, booking) => {
        acc[booking.hotelName] = (acc[booking.hotelName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const preferredHotels = Object.entries(hotelCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hotelName, bookingCount]) => ({ hotelName, bookingCount }));

    return {
      customer,
      totalBookings: bookingHistory.totalBookings,
      totalSpentCents: bookingHistory.totalSpentCents,
      averageBookingValue,
      lastBookingAt: bookingHistory.bookings[0]?.createdAt || null,
      bookingFrequency,
      preferredHotels,
    };
  }

  /**
   * Validate phone number format
   */
  private static isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation - can be enhanced based on requirements
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s-()]/g, ""));
  }

  /**
   * Validate date of birth
   */
  private static isValidDateOfBirth(dateOfBirth: string): boolean {
    const date = new Date(dateOfBirth);
    const today = new Date();
    const minAge = new Date(
      today.getFullYear() - 120,
      today.getMonth(),
      today.getDate(),
    );
    const maxAge = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate(),
    );

    return date >= minAge && date <= maxAge;
  }

  /**
   * Validate date format
   */
  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  }

  /**
   * Calculate days between two dates
   */
  private static getDaysBetweenDates(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const timeDifference = d2.getTime() - d1.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
  }
}
