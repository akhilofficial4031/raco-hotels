import { Breadcrumb, Card, Steps, Typography, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { DATE_FORMAT_API } from "../../../shared/constants/app";
import { BOOKING_STATUS } from "../../../shared/constants/bookings";
import { fetcher, mutationFetcher } from "../../../utils/swrFetcher";
import { type PromoCode } from "../../promo-code/types/promoCode";

const CHILD_ADULT_AGE_THRESHOLD = 10;
import { type RoomTypeWithRelations } from "../../room-type/types/roomType";
import BookingDetailsForm from "../components/BookingDetailsForm";
import CustomerInformationForm from "../components/CustomerInformationForm";
import ReviewAndSubmit from "../components/ReviewAndSubmit";
import RoomSelection from "../components/RoomSelection";

import type { AddonInBooking } from "../../addon/types/addon";
import type { BookingRoomTypeRooms } from "../../rooms/types/rooms";
import type { CustomerData } from "../types/schemas";

const { Title } = Typography;

interface BookingData {
  bookingDetails?: any;
  selectedRooms?: BookingRoomTypeRooms[];
  selectedAddons?: AddonInBooking[];
  customerData?: CustomerData;
  roomTypeDetails?: RoomTypeWithRelations;
  appliedPromoCode?: PromoCode | null;
}

const NewBookings = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const navigate = useNavigate();

  // Room types data is now handled in BookingDetailsForm component

  const handleBookingDetailsFinish = async (values: any) => {
    // Compute effective adult count (children 10+ count as adults)
    const childrenOver10 = (values.childrenAges ?? []).filter(
      (c: { age: number | undefined }) => (c.age ?? 0) >= CHILD_ADULT_AGE_THRESHOLD,
    ).length;
    const effectiveAdults = values.numAdults + childrenOver10;

    setIsCheckingAvailability(true);
    try {
      const checkInDate = values.dateRange[0].format(DATE_FORMAT_API);
      const checkOutDate = values.dateRange[1].format(DATE_FORMAT_API);
      const query = `/rooms/availability?hotelId=${values.hotelId}&roomTypeId=${values.roomTypeId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&guestCount=${effectiveAdults}&numberOfRooms=${values.numRooms}`;
      const result = await fetcher(query);
      const roomCount = result?.data?.roomTypes?.[0]?.rooms?.length ?? 0;

      if (roomCount === 0) {
        void message.warning(
          "No rooms are available for your selected dates and group size. Please adjust your search.",
          5,
        );
        return;
      }
    } catch {
      // API throws a validation error when no rooms found for the given roomTypeId
      void message.warning(
        "No rooms are available for your selected dates and group size. Please adjust your search.",
        5,
      );
      return;
    } finally {
      setIsCheckingAvailability(false);
    }

    setBookingData((prev) => ({ ...prev, bookingDetails: values }));
    setCurrentStep(1);
  };

  const handleRoomSelectionFinish = (values: {
    selectedRooms: BookingRoomTypeRooms[];
    selectedAddons: AddonInBooking[];
    roomTypeDetails?: RoomTypeWithRelations;
  }) => {
    setBookingData((prev) => ({
      ...prev,
      selectedRooms: values.selectedRooms,
      selectedAddons: values.selectedAddons,
      roomTypeDetails: values.roomTypeDetails,
    }));
    setCurrentStep(2);
  };

  const handleCustomerInfoFinish = (values: CustomerData) => {
    setBookingData((prev) => ({ ...prev, customerData: values }));
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handlePromoCodeChange = (promoCode: PromoCode | null) => {
    setBookingData((prev) => ({ ...prev, appliedPromoCode: promoCode }));
  };

  const getBookingStatus = (
    checkInDate: string,
    totalAmountCents: number,
    amountPaidCents: number,
  ) => {
    const today = dayjs().startOf("day");
    const isCheckInToday = dayjs(checkInDate).startOf("day").isSame(today);
    if (amountPaidCents > 0 && amountPaidCents < totalAmountCents) {
      return BOOKING_STATUS.PARTIAL_PAID;
    }
    if (amountPaidCents === totalAmountCents) {
      return BOOKING_STATUS.PAID;
    }
    if (isCheckInToday) {
      return BOOKING_STATUS.CHECKED_IN;
    }
    return BOOKING_STATUS.CONFIRMED;
  };

  const handleSubmit = async (paymentDetails: {
    amountPaidCents: number;
    taxAmountCents: number;
    totalAmountCents: number;
  }) => {
    setIsSubmitting(true);
    try {
      // Determine status based on check-in date
      const checkInDate = bookingData.bookingDetails.dateRange[0];
      const today = dayjs().startOf("day");

      const isCheckInToday = dayjs(checkInDate).startOf("day").isSame(today);
      const bookingStatus = getBookingStatus(
        checkInDate,
        paymentDetails.totalAmountCents,
        paymentDetails.amountPaidCents,
      );
      const payload = {
        hotelId: bookingData.bookingDetails.hotelId,
        bookingDetails: {
          checkInDate:
            bookingData.bookingDetails.dateRange[0].format(DATE_FORMAT_API),
          checkOutDate:
            bookingData.bookingDetails.dateRange[1].format(DATE_FORMAT_API),
          numAdults: bookingData.bookingDetails.numAdults,
          numChildren: bookingData.bookingDetails.numChildren,
          childrenAges: (bookingData.bookingDetails.childrenAges ?? []).map(
            (c: { age: number }) => c.age,
          ),
          status: bookingStatus,
        },
        customerData: {
          fullName: bookingData.customerData?.fullName,
          email: bookingData.customerData?.email,
          phone: bookingData.customerData?.phone,
          alternatePhone: bookingData.customerData?.alternatePhone,
          nationality: bookingData.customerData?.nationality,
          idType: bookingData.customerData?.idType,
          idNumber: bookingData.customerData?.idNumber,
          emergencyContactName: bookingData.customerData?.emergencyContactName,
          emergencyContactPhone:
            bookingData.customerData?.emergencyContactPhone,
          notes: bookingData.customerData?.notes,
        },
        selectedRooms: bookingData.selectedRooms?.map((room) => ({
          id: room.roomId,
        })),
        selectedAddons: bookingData.selectedAddons?.map((addon) => {
          const roomTypeAddon = bookingData.roomTypeDetails?.addons?.find(
            (a) => a.addonId === addon.id,
          );
          return {
            id: addon.id,
            priceCents: roomTypeAddon?.priceCents ?? 0,
          };
        }),
        roomTypeDetails: {
          id: bookingData.roomTypeDetails?.id,
          basePriceCents: bookingData.roomTypeDetails?.basePriceCents,
          // Note: Backend will fetch offer prices from database for security
        },
        amountPaidCents: paymentDetails.amountPaidCents,
        taxAmountCents: paymentDetails.taxAmountCents,
        totalAmountCents: paymentDetails.totalAmountCents,
        promoCode: bookingData.appliedPromoCode?.code,
      };

      await mutationFetcher("/bookings", {
        arg: {
          method: "POST",
          body: payload,
        },
      });

      const successMessage = isCheckInToday
        ? "Booking created and customer checked in successfully!"
        : "Booking created successfully!";
      message.success(successMessage);
      navigate("/bookings");
    } catch (error: any) {
      console.error("Failed to create booking:", error);
      console.error("Error details:", error?.info);

      // Show detailed error message
      const errorDetails = error?.info?.error?.details;
      const errorMessage =
        errorDetails?.errorMessage ||
        error?.info?.error?.message ||
        "Unknown error";

      message.error(`Failed to create booking: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: "Booking Details",
      content: (
        <BookingDetailsForm
          onFinish={handleBookingDetailsFinish}
          initialValues={bookingData.bookingDetails}
          mode="create"
          isLoading={isCheckingAvailability}
        />
      ),
    },
    {
      title: "Room & Add-ons",
      content: bookingData.bookingDetails ? (
        <RoomSelection
          hotelId={bookingData.bookingDetails.hotelId}
          roomTypeId={bookingData.bookingDetails.roomTypeId}
          checkInDate={bookingData.bookingDetails.dateRange[0].format(
            DATE_FORMAT_API,
          )}
          checkOutDate={bookingData.bookingDetails.dateRange[1].format(
            DATE_FORMAT_API,
          )}
          numRooms={bookingData.bookingDetails.numRooms}
          numAdults={bookingData.bookingDetails.numAdults}
          numChildren={bookingData.bookingDetails.numChildren}
          childrenAges={bookingData.bookingDetails.childrenAges ?? []}
          onNext={handleRoomSelectionFinish}
          onBack={handleBack}
          initialSelectedRooms={bookingData.selectedRooms}
          initialSelectedAddons={bookingData.selectedAddons}
          mode="create"
        />
      ) : null,
    },
    {
      title: "Customer Information",
      content: (
        <CustomerInformationForm
          onNext={handleCustomerInfoFinish}
          onBack={handleBack}
          initialData={bookingData.customerData}
        />
      ),
    },
    {
      title: "Review & Confirm",
      content:
        bookingData.customerData && bookingData.roomTypeDetails ? (
          <ReviewAndSubmit
            bookingData={bookingData}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            mode="create"
            appliedPromoCode={bookingData.appliedPromoCode}
            onPromoCodeChange={handlePromoCodeChange}
          />
        ) : null,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-4 rounded-lg mb-2 border border-gray-200">
        <div>
          <Title level={4} className="!m-0">
            Create New Booking
          </Title>
          <Breadcrumb
            className="mt-2"
            items={[
              { title: <Link to="/dashboard">Dashboard</Link> },
              { title: <Link to="/bookings">Bookings</Link> },
              { title: "New Booking" },
            ]}
          />
        </div>
      </div>
      <Card>
        <Steps
          current={currentStep}
          items={steps.map((item) => ({ key: item.title, title: item.title }))}
        />
        <div className="mt-8">{steps[currentStep].content}</div>
      </Card>
    </div>
  );
};

export default NewBookings;
