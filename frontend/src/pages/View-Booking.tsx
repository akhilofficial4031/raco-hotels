import {
  MoreOutlined,
  EditOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  Card,
  Descriptions,
  Tag,
  Dropdown,
  Button,
  Menu,
  Typography,
  Row,
  Col,
  List,
} from "antd";
import { useNavigate, useParams } from "react-router";
import useSWR from "swr";

import Spinner from "../shared/components/Spinner";
import { type ApiResponse } from "../shared/models";
import { type Booking } from "../shared/models/bookings";
import { fetcher } from "../utils/swrFetcher";

const { Title, Text } = Typography;

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

  const menu = (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => navigate(`/bookings/${id}/edit`)}
      >
        Edit
      </Menu.Item>
      {booking?.status === "confirmed" && (
        <Menu.Item key="cancel" icon={<CloseCircleOutlined />}>
          Cancel Booking
        </Menu.Item>
      )}
    </Menu>
  );

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

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-4 rounded-lg mb-2 border border-gray-200">
        <div>
          <Title level={4} className="!m-0">
            Booking #{booking.referenceCode}
          </Title>
        </div>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      </div>
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Card title="Booking Details">
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
                  {new Date(booking.checkInDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Check-out">
                  {new Date(booking.checkOutDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Guests">
                  {booking.numAdults} Adults, {booking.numChildren} Children
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: booking.currencyCode,
                  }).format(booking.totalAmountCents / 100)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card title="Rooms" className="mt-4">
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
            <Card title="Customer Details">
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
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default ViewBooking;
