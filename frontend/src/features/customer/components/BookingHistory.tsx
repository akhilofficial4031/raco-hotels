import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  List,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import React from "react";
import { useNavigate } from "react-router";

import { type CustomerDetailsResponse } from "../../../shared/services/customer.service";

type CustomerBooking = CustomerDetailsResponse["bookingHistory"]["past"][0];

const { Text } = Typography;
const { TabPane } = Tabs;

interface BookingHistoryProps {
  bookingHistory: CustomerDetailsResponse["bookingHistory"];
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ bookingHistory }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "blue";
      case "checkedin":
        return "green";
      case "checkedout":
        return "purple";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const formatCurrency = (cents: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderBookingList = (
    bookings: CustomerBooking[],
    avatarColor: string,
  ) => (
    <List
      dataSource={bookings}
      renderItem={(booking) => (
        <List.Item
          actions={[
            <Button
              type="link"
              onClick={() => navigate(`/bookings/${booking.id}`)}
            >
              View Details
            </Button>,
          ]}
        >
          <List.Item.Meta
            avatar={
              <Avatar
                style={{ backgroundColor: avatarColor }}
                icon={<CalendarOutlined />}
              />
            }
            title={
              <div className="flex justify-between">
                <Text strong>{booking.referenceCode}</Text>
                <Tag color={getStatusColor(booking.status)}>
                  {booking.status?.toUpperCase()}
                </Tag>
              </div>
            }
            description={
              <div>
                <div>{booking.hotel.name}</div>
                <div>
                  {formatDate(booking.checkInDate)} -{" "}
                  {formatDate(booking.checkOutDate)}
                </div>
                <div>
                  {booking.numAdults} Adults, {booking.numChildren} Children
                </div>
                <div className="mt-1">
                  <Text strong>
                    {formatCurrency(
                      booking.totalAmountCents,
                      booking.currencyCode,
                    )}
                  </Text>
                </div>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );

  const renderEmptyState = (icon: React.ReactNode, message: string) => (
    <div className="text-center py-8 empty-state">
      {icon}
      <div className="mt-3">
        <Text type="secondary">{message}</Text>
      </div>
    </div>
  );

  const pastBookingsTable = (
    <Table
      dataSource={bookingHistory.past.slice(0, 20)}
      columns={[
        {
          title: "Reference",
          dataIndex: "referenceCode",
          key: "referenceCode",
          render: (text, record) => (
            <div>
              <Text strong>{text}</Text>
              <br />
              <Tag color={getStatusColor(record.status)}>
                {record.status?.toUpperCase()}
              </Tag>
            </div>
          ),
        },
        {
          title: "Hotel",
          dataIndex: ["hotel", "name"],
          key: "hotel",
          render: (text) => <Text>{text}</Text>,
        },
        {
          title: "Check-in",
          dataIndex: "checkInDate",
          key: "checkInDate",
          render: (date) => formatDate(date),
        },
        {
          title: "Check-out",
          dataIndex: "checkOutDate",
          key: "checkOutDate",
          render: (date) => formatDate(date),
        },
        {
          title: "Guests",
          key: "guests",
          render: (_, record) => (
            <Text>
              {record.numAdults}A, {record.numChildren}C
            </Text>
          ),
        },
        {
          title: "Amount",
          dataIndex: "totalAmountCents",
          key: "totalAmountCents",
          render: (amount, record) => (
            <Text strong>{formatCurrency(amount, record.currencyCode)}</Text>
          ),
        },
        {
          title: "Actions",
          key: "actions",
          render: (_, record) => (
            <Button
              type="link"
              size="small"
              onClick={() => navigate(`/bookings/${record.id}`)}
            >
              View
            </Button>
          ),
        },
      ]}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} bookings`,
      }}
      size="small"
      scroll={{ x: 800 }}
    />
  );

  return (
    <Card
      title={
        <>
          <CalendarOutlined /> Booking History
        </>
      }
      className="customer-card"
    >
      <Tabs defaultActiveKey="active">
        <TabPane
          tab={
            <Badge count={bookingHistory.active.length} showZero>
              <span className="flex items-center">
                <ClockCircleOutlined className="mr-1" />
                Active
              </span>
            </Badge>
          }
          key="active"
          className="tab-panel"
        >
          {bookingHistory.active.length > 0
            ? renderBookingList(bookingHistory.active, "#1890ff")
            : renderEmptyState(
                <ClockCircleOutlined
                  style={{ fontSize: "48px", color: "#d9d9d9" }}
                />,
                "-",
              )}
        </TabPane>

        <TabPane
          tab={
            <Badge count={bookingHistory.future.length} showZero>
              <span className="flex items-center">
                <ExclamationCircleOutlined className="mr-1" />
                Upcoming
              </span>
            </Badge>
          }
          key="future"
        >
          {bookingHistory.future.length > 0
            ? renderBookingList(bookingHistory.future, "#52c41a")
            : renderEmptyState(
                <ExclamationCircleOutlined
                  style={{ fontSize: "48px", color: "#d9d9d9" }}
                />,
                "-",
              )}
        </TabPane>

        <TabPane
          tab={
            <Badge count={bookingHistory.past.length} showZero>
              <span className="flex items-center">
                <CheckCircleOutlined className="mr-1" />
                Past
              </span>
            </Badge>
          }
          key="past"
        >
          {bookingHistory.past.length > 0 ? (
            <div>
              <div className="mb-4 flex justify-end">
                <Space>
                  <Button type="text" size="small">
                    List View
                  </Button>
                  <Button type="text" size="small">
                    Table View
                  </Button>
                </Space>
              </div>
              {pastBookingsTable}
            </div>
          ) : (
            renderEmptyState(
              <CheckCircleOutlined
                style={{ fontSize: "48px", color: "#d9d9d9" }}
              />,
              "-",
            )
          )}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default BookingHistory;
