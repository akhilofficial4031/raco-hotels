import { Steps, Card, Typography, Breadcrumb, message } from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import useSWR from "swr";

import BookingDetailsForm from "../features/bookings/BookingDetailsForm";
import CustomerInformationForm from "../features/bookings/CustomerInformationForm";
import ReviewAndSubmit from "../features/bookings/ReviewAndSubmit";
import { type CustomerData } from "../features/bookings/schemas";
import { updateBooking } from "../features/bookings/services/booking.service";
import Spinner from "../shared/components/Spinner";
import { type ApiResponse } from "../shared/models";
import { type Booking } from "../shared/models/bookings";
import { fetcher } from "../utils/swrFetcher";

const { Title } = Typography;

interface BookingData {
  bookingDetails?: any;
  customerData?: CustomerData;
}

function EditBooking() {
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

  const handleCustomerInfoFinish = (values: CustomerData) => {
    setBookingData((prev) => ({ ...prev, customerData: values }));
    setCurrentStep(2);
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
          "YYYY-MM-DD",
        ),
        checkOutDate: dayjs(bookingData.bookingDetails.checkOutDate).format(
          "YYYY-MM-DD",
        ),
        numAdults: bookingData.bookingDetails.numAdults,
        numChildren: bookingData.bookingDetails.numChildren,
        status: bookingData.bookingDetails.status,
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
    };

    try {
      const apiResponse = await updateBooking(id, payload);
      if (apiResponse.success) {
        message.success("Booking updated successfully!");
        navigate(`/bookings/${id}`);
      } else {
        message.error(
          (apiResponse as any).error || "Failed to update booking.",
        );
      }
    } catch {
      message.error("An error occurred while updating the booking.");
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
          mode="edit"
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
            Edit Booking #{booking?.referenceCode}
          </Title>
          <Breadcrumb
            className="mt-2"
            items={[
              { title: <Link to="/dashboard">Dashboard</Link> },
              { title: <Link to="/bookings">Bookings</Link> },
              { title: "Edit Booking" },
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

export default EditBooking;
