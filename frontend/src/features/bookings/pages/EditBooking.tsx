import { ArrowLeftOutlined } from "@ant-design/icons";
import { Steps, Card, Typography, message, Button } from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import useSWR, { mutate } from "swr";

import Spinner from "@shared/components/Spinner";
import { DATE_FORMAT_API } from "@shared/constants/app";
import { type ApiResponse } from "@shared/models";
import { fetcher } from "@utils/swrFetcher";
import { type Booking } from "src/features/bookings/types/bookings";

import { type AddonInBooking } from "../../addon/types/addon";
import { type PromoCode } from "../../promo-code/types/promoCode";
import { type RoomTypeWithRelations } from "../../room-type/types/roomType";
import { type BookingRoomTypeRooms } from "../../rooms/types/rooms";
import BookingDetailsForm from "../components/BookingDetailsForm";
import CustomerInformationForm from "../components/CustomerInformationForm";
import ReviewAndSubmit from "../components/ReviewAndSubmit";
import RoomSelection from "../components/RoomSelection";
import { updateBooking } from "../services/bookingService";
import { type CustomerData } from "../types/schemas";

const { Title } = Typography;

interface BookingData {
  bookingDetails?: any;
  customerData?: CustomerData;
  selectedRooms?: BookingRoomTypeRooms[];
  selectedAddons?: AddonInBooking[];
}

function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(
    null,
  );

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
          childrenAges: (booking.children ?? []).map((c) => ({ age: c.age })),
          status: booking.status,
          hotelId: booking.hotelId,
          roomTypeId: booking.items?.[0]?.room.roomTypeId,
          numRooms: booking.items?.length,
          amountPaidCents: booking.amountPaidCents,
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
        selectedRooms:
          booking.items
            ?.map((item: any) => {
              const room = item.room;
              if (!room) return null;
              return {
                roomId: room.id,
                roomNumber: room.roomNumber,
                floor: room.floor,
                roomDescription: room.description,
                status: room.status,
              };
            })
            .filter(
              (room): room is NonNullable<typeof room> => room !== null,
            ) || [],
        selectedAddons: booking.addons?.map((a: any) => a.addon) || [],
      });

      // Set applied promo code if exists
      if (booking.promotions && booking.promotions.length > 0) {
        const promoCodeData = booking.promotions[0].promo_code;
        if (promoCodeData) {
          setAppliedPromoCode(promoCodeData);
        }
      }
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
    setAppliedPromoCode(promoCode);
  };

  const handleSubmit = async (paymentDetails: {
    amountPaidCents: number;
    taxAmountCents: number;
    totalAmountCents: number;
  }) => {
    if (!id) return;

    // Validate we have selected rooms
    if (!bookingData.selectedRooms || bookingData.selectedRooms.length === 0) {
      message.error("Please select at least one room for this booking.");
      return;
    }

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
        childrenAges: (bookingData.bookingDetails.childrenAges ?? []).map(
          (c: { age: number }) => c.age,
        ),
        status: bookingData.bookingDetails.status,
        roomTypeId: bookingData.bookingDetails.roomTypeId,
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
      selectedRooms:
        bookingData.selectedRooms
          ?.filter((room) => room && (room.roomId || room.id))
          .map((room) => ({
            id: room.roomId || room.id,
          })) || [],
      selectedAddons:
        bookingData.selectedAddons
          ?.filter((addon) => addon && addon.id)
          .map((addon) => ({
            id: addon.id,
          })) || [],
      amountPaidCents: paymentDetails.amountPaidCents,
      taxAmountCents: paymentDetails.taxAmountCents,
      totalAmountCents: paymentDetails.totalAmountCents,
    };

    // Final validation - ensure all room IDs are valid
    if (!payload.selectedRooms || payload.selectedRooms.length === 0) {
      message.error(
        "Unable to process booking rooms. Please try re-selecting the rooms.",
      );
      setIsSubmitting(false);
      return;
    }

    const hasInvalidRoomIds = payload.selectedRooms.some((room) => !room.id);
    if (hasInvalidRoomIds) {
      message.error(
        "Some rooms have invalid IDs. Please try re-selecting the rooms.",
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const apiResponse = await updateBooking(id, payload);
      if (apiResponse.success) {
        message.success("Booking updated successfully!");
        mutate(`/bookings/${id}`);
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
          numAdults={bookingData.bookingDetails.numAdults}
          numChildren={bookingData.bookingDetails.numChildren}
          childrenAges={bookingData.bookingDetails.childrenAges ?? []}
          onNext={handleRoomSelectionFinish}
          onBack={handleBack}
          initialSelectedRooms={bookingData.selectedRooms}
          initialSelectedAddons={bookingData.selectedAddons || []}
          mode="edit"
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
          mode="edit"
          appliedPromoCode={appliedPromoCode}
          onPromoCodeChange={handlePromoCodeChange}
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
        <div className="flex items-center gap-2">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/bookings")}
          />
          <Title level={4} className="!m-0">
            Edit Booking #{booking?.referenceCode}
          </Title>
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
