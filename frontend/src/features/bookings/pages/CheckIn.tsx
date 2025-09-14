import Spinner from "@shared/components/Spinner";
import { DATE_FORMAT_API } from "@shared/constants/app";
import { BOOKING_STATUS } from "@shared/constants/bookings";
import { type ApiResponse } from "@shared/models";
import { type Addon } from "@shared/models/addon";
import { type Booking } from "@shared/models/bookings";
import { type IRoom } from "@shared/models/rooms";
import { Steps, Card, Typography, Breadcrumb, message } from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import useSWR, { mutate } from "swr";

import { fetcher } from "../../../utils/swrFetcher";
import BookingDetailsForm from "../components/BookingDetailsForm";
import CustomerInformationForm from "../components/CustomerInformationForm";
import ReviewAndSubmit from "../components/ReviewAndSubmit";
import RoomSelection from "../components/RoomSelection";
import { updateBooking } from "../services/booking.service";
import { type CustomerData } from "../types/schemas";

const { Title } = Typography;

interface BookingData {
  bookingDetails?: any;
  customerData?: CustomerData;
  selectedRooms?: IRoom[];
  selectedAddons?: Addon[];
}

function CheckIn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<ApiResponse<{ booking: Booking }>>(
    id ? `/bookings/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2 * 60 * 1000, // 2 minutes
    },
  );

  const booking = response?.data?.booking;

  useEffect(() => {
    if (booking) {
      setBookingData({
        bookingDetails: {
          checkInDate: dayjs(booking.checkInDate),
          checkOutDate: dayjs(booking.checkOutDate),
          numAdults: booking.numAdults,
          numChildren: booking.numChildren,
          status: booking.status,
          hotelId: booking.hotelId,
          roomTypeId: booking.items?.[0]?.room.roomTypeId,
          numRooms: booking.items?.length,
        },
        customerData: {
          fullName: booking.customer?.fullName ?? "",
          email: booking.customer?.email ?? "",
          phone: booking.customer?.phone ?? "",
          alternatePhone: booking.customer?.alternatePhone ?? "",
          nationality: booking.customer?.nationality ?? "",
          idType: booking.customer?.idType ?? "",
          idNumber: booking.customer?.idNumber ?? "",
          emergencyContactName: booking.customer?.emergencyContactName ?? "",
          emergencyContactPhone: booking.customer?.emergencyContactPhone ?? "",
          notes: booking.customer?.notes ?? "",
        },
        selectedRooms: booking.items?.map((item: any) => item.room),
        selectedAddons: booking.addons,
      });
    }
  }, [booking]);

  const handleBookingDetailsFinish = (values: any) => {
    setBookingData((prev) => ({
      ...prev,
      bookingDetails: {
        ...prev.bookingDetails,
        ...values,
        checkInDate: dayjs(values.dateRange[0]),
        checkOutDate: dayjs(values.dateRange[1]),
      },
    }));
    setCurrentStep(1);
  };

  const handleRoomSelectionFinish = (values: {
    selectedRooms: IRoom[];
    selectedAddons: Addon[];
  }) => {
    setBookingData((prev) => ({
      ...prev,
      selectedRooms: values.selectedRooms,
      selectedAddons: values.selectedAddons,
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

  const handleSubmit = async () => {
    if (!id) return;
    setIsSubmitting(true);

    const payload = {
      bookingDetails: {
        checkInDate: dayjs(bookingData.bookingDetails.checkInDate).format(
          DATE_FORMAT_API,
        ),
        checkOutDate: dayjs(bookingData.bookingDetails.checkOutDate).format(
          DATE_FORMAT_API,
        ),
        numAdults: bookingData.bookingDetails.numAdults,
        numChildren: bookingData.bookingDetails.numChildren,
        status: BOOKING_STATUS.CHECKED_IN,
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
        emergencyContactPhone: bookingData.customerData?.emergencyContactPhone,
        notes: bookingData.customerData?.notes,
      },
      selectedRooms: bookingData.selectedRooms?.map((room) => ({
        id: room.id,
      })),
      selectedAddons: bookingData.selectedAddons?.map((addon) => ({
        id: addon.id,
      })),
    };

    try {
      const apiResponse = await updateBooking(id, payload);
      if (apiResponse.success) {
        message.success("Customer checked in successfully!");
        mutate(`/bookings/${id}`);
        navigate(`/bookings/${id}`);
      } else {
        message.error(
          (apiResponse as any).error || "Failed to check in customer.",
        );
      }
    } catch {
      message.error("An error occurred while checking in the customer.");
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
          mode="edit"
        />
      ),
    },
    {
      title: "Room & Add-ons",
      content: bookingData.bookingDetails ? (
        <RoomSelection
          hotelId={bookingData.bookingDetails.hotelId}
          roomTypeId={bookingData.bookingDetails.roomTypeId}
          checkInDate={bookingData.bookingDetails.checkInDate.format(
            DATE_FORMAT_API,
          )}
          checkOutDate={bookingData.bookingDetails.checkOutDate.format(
            DATE_FORMAT_API,
          )}
          numRooms={bookingData.bookingDetails.numRooms}
          onNext={handleRoomSelectionFinish}
          onBack={handleBack}
          initialSelectedRooms={bookingData.selectedRooms}
          initialSelectedAddons={booking?.addons?.map((addon) => addon.addon)}
          mode="checkin"
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
      content: (
        <ReviewAndSubmit
          bookingData={bookingData}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="checkin"
          onPromoCodeChange={() => {}}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Failed to load booking data.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-4 rounded-lg mb-2 border border-gray-200">
        <div>
          <Title level={4} className="!m-0">
            Check In #{booking?.referenceCode}
          </Title>
          <Breadcrumb
            className="mt-2"
            items={[
              { title: <Link to="/dashboard">Dashboard</Link> },
              { title: <Link to="/bookings">Bookings</Link> },
              { title: "Check In" },
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
}

export default CheckIn;
