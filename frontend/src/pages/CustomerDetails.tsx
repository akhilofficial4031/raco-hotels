import { Alert, Button, Col, Row, Typography } from "antd";
import React from "react";
import { useParams } from "react-router";

import "../features/customer/styles/CustomerDetails.css";
import {
  AddressAndContact,
  BookingHistory,
  CurrentBookingAlert,
  CustomerHeader,
  InternalNotes,
  PaymentHistory,
  PersonalInformation,
  PreferencesAndRequirements,
  PromoCodeUsage,
  SpendingSummary,
} from "../features/customer/components";
import { useCustomerDetails } from "../features/customer/hooks/useCustomerDetails";

const { Text } = Typography;

function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: customerData, loading, error } = useCustomerDetails(id);

  // Debug logging
  console.log("CustomerDetails - customerData:", customerData);
  console.log("CustomerDetails - loading:", loading);
  console.log("CustomerDetails - error:", error);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <Text>Loading customer details...</Text>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // No data state
  if (!customerData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert
          message="No Data"
          description="Customer details not found."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Destructure with safety checks - handle both direct response and wrapped response
  const responseData = customerData.data || customerData;
  const {
    customer,
    currentBooking,
    bookingHistory,
    promoUsage,
    spendingAnalytics,
    paymentHistory,
  } = responseData;

  // Create a safe customer object with default values
  const safeCustomer = customer || {
    id: 0,
    email: "-",
    fullName: "-",
    phone: "-",
    alternatePhone: null,
    dateOfBirth: null,
    gender: null,
    nationality: null,
    idType: null,
    idNumber: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    country: null,
    postalCode: null,
    dietaryPreferences: [],
    specialRequests: [],
    emergencyContactName: null,
    emergencyContactPhone: null,
    loyaltyNumber: null,
    marketingOptIn: false,
    status: "active" as const,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastBookingAt: null,
    totalBookings: 0,
    totalSpentCents: 0,
    vipStatus: "regular" as const,
    preferredPaymentMethod: null,
    preferredContactMethod: "email" as const,
    languagePreference: "en",
    timeZone: null,
    hasUserAccount: false,
    firstBookingSource: "web" as const,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen customer-details-container">
      {/* Show warning if data is incomplete */}
      {!customer && (
        <Alert
          message="Partial Data Available"
          description="Some customer information may be missing. Displaying available data with placeholders."
          type="info"
          showIcon
          className="info-alert"
        />
      )}

      {/* Header Section */}
      <CustomerHeader
        customer={safeCustomer}
        currentBooking={currentBooking}
        customerId={id!}
      />

      {/* Current Booking Status */}
      <CurrentBookingAlert currentBooking={currentBooking} />

      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Personal Information */}
          <PersonalInformation customer={safeCustomer} />

          {/* Address & Emergency Contact */}
          <AddressAndContact customer={safeCustomer} />

          {/* Preferences & Special Requirements */}
          <PreferencesAndRequirements customer={safeCustomer} />

          {/* Internal Notes */}
          <InternalNotes notes={safeCustomer.notes || ""} />
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* VIP Status & Spending Summary */}
          <SpendingSummary
            customer={safeCustomer}
            spendingAnalytics={
              spendingAnalytics || {
                totalSpentCents: 0,
                averageBookingValueCents: 0,
                lastBookingAmountCents: null,
                mostVisitedHotel: null,
                spendingByHotel: [],
                monthlySpending: [],
              }
            }
          />

          {/* Promo Codes Used */}
          <PromoCodeUsage promoUsage={promoUsage || []} />
        </Col>
      </Row>

      {/* Booking History */}
      <BookingHistory
        bookingHistory={bookingHistory || { past: [], active: [], future: [] }}
      />

      {/* Payment History */}
      <PaymentHistory paymentHistory={paymentHistory || []} />
    </div>
  );
}

export default CustomerDetails;
