import {
  MoreOutlined,
  EditOutlined,
  CloseCircleOutlined,
  LoginOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
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
import { useNavigate, useParams } from "react-router";
import useSWR, { mutate } from "swr";

import Spinner from "@shared/components/Spinner";
import { APP_LOCALE } from "@shared/constants/app";
import { type ApiResponse } from "@shared/models/common";
import { fetcher, mutationFetcher } from "@utils/swrFetcher";

import { type Booking } from "../types/bookings";

const { Title, Text } = Typography;
const { confirm } = Modal;

function ViewBooking() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<ApiResponse<{ booking: Booking }>>(
    id ? `/bookings/${id}` : null,
    fetcher,
  );

  const booking = response?.data?.booking;

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
      onClick: () => navigate(`/bookings/${id}/checkin`),
    },
    booking?.status?.toLowerCase() === "checkedin" && {
      key: "checkout",
      icon: <CheckCircleOutlined />,
      label: "Check out",
      onClick: handleCheckoutBooking,
    },
    {
      key: "cancel",
      icon: <CloseCircleOutlined />,
      label: "Cancel Booking",
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
  const feeAmount = booking.feeAmountCents ?? 0;
  const addonsTotal =
    booking.addons?.reduce(
      (acc, item) => acc + (item.booking_addon.priceCents || 0),
      0,
    ) ?? 0;
  const roomPrice =
    totalAmount - addonsTotal - taxAmount - feeAmount + discountAmount;

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-4 rounded-lg mb-2 border border-gray-200">
        <div>
          <Title level={4} className="!m-0">
            Booking #{booking.referenceCode}
          </Title>
        </div>
        <div className="flex items-center gap-2">
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </div>
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
                <Descriptions.Item label="Taxes">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: booking.currencyCode,
                  }).format(taxAmount / 100)}
                </Descriptions.Item>

                <Descriptions.Item label="Discount">
                  -
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: booking.currencyCode,
                  }).format(discountAmount / 100)}
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
    </div>
  );
}

export default ViewBooking;
