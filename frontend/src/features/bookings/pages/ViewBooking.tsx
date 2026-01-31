import {
  MoreOutlined,
  EditOutlined,
  CloseCircleOutlined,
  LoginOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  UserDeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  Card,
  Descriptions,
  Tag,
  Dropdown,
  Button,
  Typography,
  Row,
  Col,
  List,
  type MenuProps,
  Modal,
  message,
} from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import useSWR, { mutate } from "swr";

import Spinner from "@shared/components/Spinner";
import { APP_LOCALE } from "@shared/constants/app";
import { type ApiResponse } from "@shared/models/common";
import { fetcher, mutationFetcher } from "@utils/swrFetcher";

import { type Booking, type CancelBookingRequest } from "../types/bookings";
import CancellationModal from "../components/CancellationModal";

const { Title, Text } = Typography;
const { confirm } = Modal;

function ViewBooking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<ApiResponse<{ booking: Booking }>>(
    id ? `/bookings/${id}` : null,
    fetcher,
  );

  const booking = response?.data?.booking;

  const handleCheckIn = () => {
    if (!booking) return;

    confirm({
      title: "Are you sure you want to check in this booking?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will check in booking #${booking.referenceCode}.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/bookings/${booking.id}/checkin`, {
            arg: { method: "PATCH" },
          });
          message.success("Booking checked in successfully!");
          mutate(`/bookings/${id}`);
        } catch (err) {
          if (err) {
            message.error("Failed to check in booking.");
          }
        }
      },
    });
  };

  const handleCheckoutBooking = () => {
    if (!booking) return;

    const remainingAmount =
      booking.balanceDueCents ??
      (booking.totalAmountCents ?? 0) - (booking.amountPaidCents ?? 0);

    const content = (
      <div>
        <p>This action will check out booking {booking?.referenceCode}.</p>
        {remainingAmount > 0 && (
          <p style={{ color: "red" }}>
            Pending amount to be paid:{" "}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: booking.currencyCode,
            }).format(remainingAmount / 100)}
          </p>
        )}
      </div>
    );

    confirm({
      title: "Are you sure you want to check out this booking?",
      icon: <ExclamationCircleOutlined />,
      content,
      onOk: async () => {
        try {
          await mutationFetcher(`/bookings/${booking?.id}/checkout`, {
            arg: { method: "PATCH" },
          });
          message.success("Booking checked out successfully");
          mutate(`/bookings/${id}`);
        } catch (err) {
          if (err) {
            message.error("Failed to check out booking");
          }
        }
      },
    });
  };

  const handleNoShowBooking = () => {
    if (!booking) return;

    confirm({
      title: "Are you sure you want to mark this booking as no show?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will mark booking #${booking.referenceCode} as no show.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/bookings/${booking.id}/noshow`, {
            arg: { method: "PATCH" },
          });
          message.success("Booking marked as no show successfully");
          mutate(`/bookings/${id}`);
        } catch (err) {
          if (err) {
            message.error("Failed to mark booking as no show");
          }
        }
      },
    });
  };

  const handleCancelBooking = () => {
    setCancellationModalOpen(true);
  };

  const handleCancelConfirm = async (data: CancelBookingRequest) => {
    if (!booking) return;

    try {
      setCancelLoading(true);
      const response: any = await mutationFetcher(`/bookings/${booking.id}/cancel`, {
        arg: {
          method: "PATCH",
          body: data,
        },
      });
      
      // Show appropriate message based on refund processing result
      if (data.refundAmountCents && data.refundAmountCents > 0) {
        if (response.data?.refundProcessed) {
          message.success("Booking cancelled and refund processed via Razorpay successfully");
        } else if (response.data?.refundMarkedManual) {
          message.warning("Booking cancelled. Refund marked for manual processing (no Razorpay payment found)");
        } else {
          message.success("Booking cancelled successfully");
        }
      } else {
        message.success("Booking cancelled successfully");
      }
      
      setCancellationModalOpen(false);
      mutate(`/bookings/${id}`);
    } catch (err) {
      message.error(
        (err as Error).message || "Failed to cancel booking. Please try again."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "green";
      case "checkedin":
        return "blue";
      case "checkedout":
        return "purple";
      case "cancelled":
        return "red";
      case "noshow":
        return "volcano";
      case "pending_cancellation":
        return "orange";
      default:
        return "default";
    }
  };

  const menuItems = [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => navigate(`/bookings/${id}/edit`),
    },
    booking?.status?.toLowerCase() === "confirmed" && {
      key: "checkin",
      icon: <LoginOutlined />,
      label: "Check In",
      onClick: handleCheckIn,
    },
    booking?.status?.toLowerCase() === "checkedin" && {
      key: "checkout",
      icon: <CheckCircleOutlined />,
      label: "Check out",
      onClick: handleCheckoutBooking,
    },
    (booking?.status?.toLowerCase() === "confirmed" ||
      booking?.status?.toLowerCase() === "checkedin") && {
      key: "noshow",
      icon: <UserDeleteOutlined />,
      label: "Mark as No Show",
      onClick: handleNoShowBooking,
    },
    booking?.status?.toLowerCase() === "pending_cancellation" && {
      key: "process_cancel",
      icon: <CloseCircleOutlined />,
      label: "Process Cancellation",
      onClick: handleCancelBooking,
    },
    (booking?.status?.toLowerCase() === "confirmed" ||
      booking?.status?.toLowerCase() === "checkedin") && {
      key: "cancel",
      icon: <CloseCircleOutlined />,
      label: "Cancel Booking",
      onClick: handleCancelBooking,
    },
  ].filter(Boolean) as Required<MenuProps>["items"];

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
        Failed to fetch booking details.
      </div>
    );
  }

  if (!booking) {
    return <div className="text-center p-4">Booking not found.</div>;
  }

  const paidAmount = booking.amountPaidCents ?? 0;
  const totalAmount = booking.totalAmountCents ?? 0;
  const remainingAmount = booking.balanceDueCents ?? totalAmount - paidAmount;
  const discountAmount = booking.discountAmountCents ?? 0;
  const taxAmount = booking.taxAmountCents ?? 0;
  const addonsTotal =
    booking.addons?.reduce(
      (acc, item) => acc + (item.booking_addon.priceCents || 0),
      0,
    ) ?? 0;
  // Use stored room price from booking (calculated at booking time with correct offer price)
  const nights =
    dayjs(booking.checkOutDate).diff(dayjs(booking.checkInDate), "day") || 1;
  const numRooms = booking.items?.length || 1;

  // Calculate room price total using stored per-night price or fallback to reverse calculation
  // Note: roomPriceCents will be 0 for existing bookings created before this field was added
  const roomPrice =
    booking.roomPriceCents && booking.roomPriceCents > 0
      ? booking.roomPriceCents * nights * numRooms
      : totalAmount - addonsTotal + discountAmount - taxAmount;

  const subtotal = roomPrice + addonsTotal;
  const subtotalAfterDiscount = subtotal - discountAmount;

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-4 rounded-lg mb-2 border border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/bookings")}
          />
          <Title level={4} className="!m-0">
            Booking #{booking.referenceCode}
          </Title>
        </div>
        {booking.status !== "checkedout" && (
          <div className="flex items-center gap-2">
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        )}
      </div>
      {booking.status === "pending_cancellation" && (
        <Alert
          message="Cancellation Requested"
          description={
            <div>
              <p>The customer has requested to cancel this booking via the public cancellation system.</p>
              {booking.notes && booking.notes.includes("Customer requested cancellation via OTP") && (
                <p>Please review the booking details and process the refund if applicable.</p>
              )}
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Card title="Booking Details" className="!mb-4">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Hotel">
                  {booking.hotel?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(booking.status)}>
                    {booking.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Check-in">
                  {new Date(booking.checkInDate).toLocaleDateString(APP_LOCALE)}
                </Descriptions.Item>
                <Descriptions.Item label="Check-out">
                  {new Date(booking.checkOutDate).toLocaleDateString(
                    APP_LOCALE,
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Guests">
                  {booking.numAdults} Adults, {booking.numChildren} Children
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card title="Rooms" className="!mb-4">
              <List
                dataSource={booking.items}
                renderItem={(item: any) => (
                  <>
                    <List.Item>
                      <List.Item.Meta
                        title={item.room_type?.name}
                        description={`Room Number: ${item.room?.roomNumber}`}
                      />
                    </List.Item>
                  </>
                )}
              />
            </Card>
            <Card title="Add-ons" className="mt-4">
              <List
                dataSource={booking.addons}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.addon?.name}
                      description={`Quantity: ${item.booking_addon.quantity}`}
                    />
                    <Text>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: booking.currencyCode,
                      }).format(item.booking_addon.priceCents / 100)}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
            {booking.customer?.notes && (
              <Card title="Additional Notes" className="!mt-4">
                <div
                  style={{
                    padding: "12px",
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                    borderRadius: "6px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  <Text>{booking.customer.notes}</Text>
                </div>
              </Card>
            )}
          </Col>
          <Col xs={24} md={8}>
            <Card title="Customer Details" className="!mb-4">
              <Descriptions column={1}>
                <Descriptions.Item label="Name">
                  {booking.customer?.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {booking.customer?.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {booking.customer?.phone}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card title="Payment Details" className="mt-4">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Room Price">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: booking.currencyCode,
                  }).format(roomPrice / 100)}
                </Descriptions.Item>
                <Descriptions.Item label="Add-ons">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: booking.currencyCode,
                  }).format(addonsTotal / 100)}
                </Descriptions.Item>
                <Descriptions.Item label="Subtotal">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: booking.currencyCode,
                  }).format(subtotal / 100)}
                </Descriptions.Item>
                {discountAmount > 0 && (
                  <>
                    <Descriptions.Item label="Discount (Promo Code)">
                      <span>
                        -
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: booking.currencyCode,
                        }).format(discountAmount / 100)}
                        {booking.promotions &&
                          booking.promotions.length > 0 &&
                          booking.promotions[0].promo_code && (
                            <Tag color="green" style={{ marginLeft: 8 }}>
                              {booking.promotions[0].promo_code.code}
                            </Tag>
                          )}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Subtotal After Discount">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: booking.currencyCode,
                      }).format(subtotalAfterDiscount / 100)}
                    </Descriptions.Item>
                  </>
                )}
                <Descriptions.Item label="Taxes & Fees (18%)">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: booking.currencyCode,
                  }).format(taxAmount / 100)}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: booking.currencyCode,
                  }).format(totalAmount / 100)}
                </Descriptions.Item>
                <Descriptions.Item label="Paid Amount">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: booking.currencyCode,
                  }).format(paidAmount / 100)}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Remaining Amount"
                  style={{ color: remainingAmount > 0 ? "red" : "green" }}
                >
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: booking.currencyCode,
                  }).format(remainingAmount / 100)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>
      <CancellationModal
        open={cancellationModalOpen}
        booking={booking || null}
        onCancel={() => setCancellationModalOpen(false)}
        onConfirm={handleCancelConfirm}
        loading={cancelLoading}
        isPendingCancellation={booking?.status === "pending_cancellation"}
      />
    </div>
  );
}

export default ViewBooking;
