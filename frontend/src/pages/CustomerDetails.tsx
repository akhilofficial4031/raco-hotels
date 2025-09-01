import {
  MoreOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
  DollarOutlined,
  CrownOutlined,
  CalendarOutlined,
  HomeOutlined,
  TagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  HeartOutlined,
  CreditCardOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
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
  Avatar,
  Statistic,
  Badge,
  Alert,
  Space,
  Tabs,
  Table,
} from "antd";
import React from "react";
import { useNavigate, useParams } from "react-router";

import { type Customer } from "../shared/models/customer";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Extended interfaces for comprehensive customer details
interface CustomerBooking {
  id: number;
  referenceCode: string;
  hotel: {
    id: number;
    name: string;
  };
  status: "confirmed" | "checkedin" | "checkedout" | "cancelled";
  checkInDate: string;
  checkOutDate: string;
  totalAmountCents: number;
  currencyCode: string;
  createdAt: string;
  numAdults: number;
  numChildren: number;
  items: Array<{
    room_type: {
      name: string;
    };
    room: {
      roomNumber: string;
    };
  }>;
  payments: Array<{
    amountCents: number;
    status: string;
    method: string;
    createdAt: string;
  }>;
}

interface CustomerPromoUsage {
  id: number;
  promoCode: {
    code: string;
    type: "percent" | "fixed";
    value: number;
  };
  booking: {
    referenceCode: string;
    totalAmountCents: number;
    currencyCode: string;
  };
  amountCents: number;
  usedAt: string;
}

interface CustomerDetailsData {
  customer: Customer & {
    vipStatus: "regular" | "silver" | "gold" | "platinum";
    preferredPaymentMethod: string | null;
    preferredContactMethod: "email" | "phone" | "sms";
    languagePreference: string;
    timeZone: string | null;
    hasUserAccount: boolean;
    firstBookingSource: string;
  };
  currentBooking?: {
    id: number;
    referenceCode: string;
    hotel: {
      name: string;
    };
    room: {
      roomNumber: string;
      floor: string;
    };
    checkInDate: string;
    checkOutDate: string;
    status: string;
  };
  bookingHistory: {
    past: CustomerBooking[];
    active: CustomerBooking[];
    future: CustomerBooking[];
  };
  promoUsage: CustomerPromoUsage[];
  spendingAnalytics: {
    totalSpentCents: number;
    averageBookingValueCents: number;
    lastBookingAmountCents: number | null;
    mostVisitedHotel: {
      name: string;
      visits: number;
    } | null;
    spendingByHotel: Array<{
      hotelName: string;
      totalSpentCents: number;
      bookingCount: number;
    }>;
    monthlySpending: Array<{
      month: string;
      amountCents: number;
    }>;
  };
  paymentHistory: Array<{
    id: number;
    bookingReference: string;
    amountCents: number;
    currencyCode: string;
    status: string;
    method: string;
    processor: string;
    createdAt: string;
  }>;
}

function CustomerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Sample/mock data for development
  const customerData: CustomerDetailsData = {
    customer: {
      id: 1,
      email: "john.doe@example.com",
      fullName: "John Doe",
      phone: "+91-9876543210",
      alternatePhone: "+91-9876543211",
      dateOfBirth: "1990-05-15",
      gender: "male",
      nationality: "Indian",
      idType: "passport",
      idNumber: "P123456789",
      addressLine1: "123 MG Road",
      addressLine2: "Near Central Mall",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      postalCode: "560001",
      dietaryPreferences: ["vegetarian", "no-spicy"],
      specialRequests: ["quiet-room", "late-checkout"],
      emergencyContactName: "Jane Doe",
      emergencyContactPhone: "+91-9876543212",
      loyaltyNumber: "LOYAL123456",
      marketingOptIn: true,
      status: "active",
      notes:
        "VIP customer - prefers executive rooms. Has stayed with us 15 times.",
      createdAt: "2022-01-15T10:30:00Z",
      updatedAt: "2024-01-15T14:20:00Z",
      lastBookingAt: "2024-01-10T09:00:00Z",
      totalBookings: 15,
      totalSpentCents: 750000, // ₹7,500.00
      vipStatus: "gold",
      preferredPaymentMethod: "credit_card",
      preferredContactMethod: "email",
      languagePreference: "en",
      timeZone: "Asia/Kolkata",
      hasUserAccount: true,
      firstBookingSource: "web",
    },
    currentBooking: {
      id: 101,
      referenceCode: "BK2024001",
      hotel: {
        name: "Grand Hotel Bangalore",
      },
      room: {
        roomNumber: "301",
        floor: "3",
      },
      checkInDate: "2024-01-15",
      checkOutDate: "2024-01-17",
      status: "checkedin",
    },
    bookingHistory: {
      past: [
        {
          id: 100,
          referenceCode: "BK2023125",
          hotel: { id: 1, name: "Grand Hotel Bangalore" },
          status: "checkedout",
          checkInDate: "2024-01-01",
          checkOutDate: "2024-01-03",
          totalAmountCents: 25000,
          currencyCode: "INR",
          createdAt: "2023-12-25T10:00:00Z",
          numAdults: 2,
          numChildren: 1,
          items: [
            {
              room_type: { name: "Executive Suite" },
              room: { roomNumber: "301" },
            },
          ],
          payments: [
            {
              amountCents: 25000,
              status: "completed",
              method: "credit_card",
              createdAt: "2024-01-01T14:00:00Z",
            },
          ],
        },
        {
          id: 99,
          referenceCode: "BK2023118",
          hotel: { id: 2, name: "Luxury Resort Goa" },
          status: "checkedout",
          checkInDate: "2023-12-15",
          checkOutDate: "2023-12-18",
          totalAmountCents: 45000,
          currencyCode: "INR",
          createdAt: "2023-11-18T09:00:00Z",
          numAdults: 2,
          numChildren: 0,
          items: [
            {
              room_type: { name: "Deluxe Room" },
              room: { roomNumber: "205" },
            },
          ],
          payments: [
            {
              amountCents: 45000,
              status: "completed",
              method: "credit_card",
              createdAt: "2023-12-15T12:00:00Z",
            },
          ],
        },
        {
          id: 98,
          referenceCode: "BK2023105",
          hotel: { id: 1, name: "Grand Hotel Bangalore" },
          status: "checkedout",
          checkInDate: "2023-11-20",
          checkOutDate: "2023-11-22",
          totalAmountCents: 30000,
          currencyCode: "INR",
          createdAt: "2023-10-05T11:00:00Z",
          numAdults: 1,
          numChildren: 0,
          items: [
            {
              room_type: { name: "Business Suite" },
              room: { roomNumber: "401" },
            },
          ],
          payments: [
            {
              amountCents: 30000,
              status: "completed",
              method: "credit_card",
              createdAt: "2023-11-20T15:00:00Z",
            },
          ],
        },
      ],
      active: [
        {
          id: 101,
          referenceCode: "BK2024001",
          hotel: { id: 1, name: "Grand Hotel Bangalore" },
          status: "checkedin",
          checkInDate: "2024-01-15",
          checkOutDate: "2024-01-17",
          totalAmountCents: 35000,
          currencyCode: "INR",
          createdAt: "2024-01-10T09:00:00Z",
          numAdults: 2,
          numChildren: 0,
          items: [
            {
              room_type: { name: "Executive Suite" },
              room: { roomNumber: "301" },
            },
          ],
          payments: [
            {
              amountCents: 35000,
              status: "completed",
              method: "credit_card",
              createdAt: "2024-01-15T14:00:00Z",
            },
          ],
        },
      ],
      future: [
        {
          id: 102,
          referenceCode: "BK2024015",
          hotel: { id: 3, name: "Mountain View Resort" },
          status: "confirmed",
          checkInDate: "2024-02-20",
          checkOutDate: "2024-02-25",
          totalAmountCents: 55000,
          currencyCode: "INR",
          createdAt: "2024-01-08T16:00:00Z",
          numAdults: 2,
          numChildren: 2,
          items: [
            {
              room_type: { name: "Family Suite" },
              room: { roomNumber: "102" },
            },
          ],
          payments: [
            {
              amountCents: 27500,
              status: "completed",
              method: "credit_card",
              createdAt: "2024-01-08T16:30:00Z",
            },
          ],
        },
      ],
    },
    promoUsage: [
      {
        id: 1,
        promoCode: {
          code: "WELCOME20",
          type: "percent",
          value: 20,
        },
        booking: {
          referenceCode: "BK2023125",
          totalAmountCents: 25000,
          currencyCode: "INR",
        },
        amountCents: 5000,
        usedAt: "2023-12-25T10:00:00Z",
      },
      {
        id: 2,
        promoCode: {
          code: "LOYALTY15",
          type: "fixed",
          value: 1500,
        },
        booking: {
          referenceCode: "BK2023118",
          totalAmountCents: 45000,
          currencyCode: "INR",
        },
        amountCents: 1500,
        usedAt: "2023-11-18T09:00:00Z",
      },
    ],
    spendingAnalytics: {
      totalSpentCents: 750000,
      averageBookingValueCents: 50000,
      lastBookingAmountCents: 35000,
      mostVisitedHotel: {
        name: "Grand Hotel Bangalore",
        visits: 8,
      },
      spendingByHotel: [
        {
          hotelName: "Grand Hotel Bangalore",
          totalSpentCents: 400000,
          bookingCount: 8,
        },
        {
          hotelName: "Luxury Resort Goa",
          totalSpentCents: 250000,
          bookingCount: 5,
        },
        {
          hotelName: "Mountain View Resort",
          totalSpentCents: 100000,
          bookingCount: 2,
        },
      ],
      monthlySpending: [
        { month: "2023-12", amountCents: 70000 },
        { month: "2023-11", amountCents: 30000 },
        { month: "2023-10", amountCents: 25000 },
      ],
    },
    paymentHistory: [
      {
        id: 1,
        bookingReference: "BK2024001",
        amountCents: 35000,
        currencyCode: "INR",
        status: "completed",
        method: "credit_card",
        processor: "stripe",
        createdAt: "2024-01-15T14:00:00Z",
      },
      {
        id: 2,
        bookingReference: "BK2023125",
        amountCents: 25000,
        currencyCode: "INR",
        status: "completed",
        method: "credit_card",
        processor: "stripe",
        createdAt: "2024-01-01T14:00:00Z",
      },
      {
        id: 3,
        bookingReference: "BK2024015",
        amountCents: 27500,
        currencyCode: "INR",
        status: "completed",
        method: "credit_card",
        processor: "stripe",
        createdAt: "2024-01-08T16:30:00Z",
      },
      {
        id: 4,
        bookingReference: "BK2023118",
        amountCents: 45000,
        currencyCode: "INR",
        status: "completed",
        method: "credit_card",
        processor: "stripe",
        createdAt: "2023-12-15T12:00:00Z",
      },
    ],
  };

  // Simulate loading state for demo
  const error = null;

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
      case "active":
        return "green";
      case "inactive":
        return "orange";
      case "blocked":
        return "red";
      case "pending":
        return "gold";
      case "completed":
        return "green";
      case "failed":
        return "red";
      default:
        return "default";
    }
  };

  const getVipStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "platinum":
        return "#E5E4E2";
      case "gold":
        return "#FFD700";
      case "silver":
        return "#C0C0C0";
      default:
        return "#D3D3D3";
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => navigate(`/customers/${id}/edit`)}
      >
        Edit Customer
      </Menu.Item>
      <Menu.Item
        key="new-booking"
        icon={<PlusOutlined />}
        onClick={() => navigate(`/bookings/create?customerId=${id}`)}
      >
        Create Booking
      </Menu.Item>
      <Menu.Item key="email" icon={<MailOutlined />}>
        Send Email
      </Menu.Item>
      <Menu.Item key="call" icon={<PhoneOutlined />}>
        Call Customer
      </Menu.Item>
      <Menu.Item key="sms" icon={<MessageOutlined />}>
        Send SMS
      </Menu.Item>
    </Menu>
  );

  // Removed loading state since we're using sample data

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Failed to fetch customer details.
      </div>
    );
  }

  if (!customerData?.customer) {
    return <div className="text-center p-4">Customer not found.</div>;
  }

  const {
    customer,
    currentBooking,
    bookingHistory,
    promoUsage,
    spendingAnalytics,
    paymentHistory,
  } = customerData;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg mb-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <Title level={3} className="!m-0">
              {customer.fullName}
            </Title>
            <Space className="mt-1">
              <Text type="secondary">{customer.email}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">{customer.phone}</Text>
            </Space>
            <div className="mt-2">
              <Space>
                <Tag color={getStatusColor(customer.status)}>
                  {customer.status?.toUpperCase()}
                </Tag>
                {customer.vipStatus && customer.vipStatus !== "regular" && (
                  <Tag
                    color="gold"
                    icon={<CrownOutlined />}
                    style={{
                      backgroundColor: getVipStatusColor(customer.vipStatus),
                    }}
                  >
                    {customer.vipStatus?.toUpperCase()}
                  </Tag>
                )}
                {currentBooking && (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    CURRENTLY CHECKED IN
                  </Tag>
                )}
                {customer.hasUserAccount && (
                  <Tag color="blue" icon={<GlobalOutlined />}>
                    HAS USER ACCOUNT
                  </Tag>
                )}
              </Space>
            </div>
          </div>
        </div>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button icon={<MoreOutlined />} size="large" />
        </Dropdown>
      </div>

      {/* Current Booking Status */}
      {currentBooking && (
        <Alert
          message="Currently Checked In"
          description={
            <div>
              <Text strong>Room {currentBooking.room.roomNumber}</Text> at{" "}
              <Text strong>{currentBooking.hotel.name}</Text>
              <Text type="secondary">
                {" "}
                (Floor: {currentBooking.room.floor})
              </Text>
              <br />
              <Text>
                Check-in: {formatDate(currentBooking.checkInDate)} - Check-out:{" "}
                {formatDate(currentBooking.checkOutDate)}
              </Text>
            </div>
          }
          type="success"
          showIcon
          icon={<HomeOutlined />}
          className="mb-6"
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Personal Information */}
          <Card
            title={
              <>
                <UserOutlined /> Personal Information
              </>
            }
            className="mb-6"
          >
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Full Name">
                {customer.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {customer.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {customer.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Alternate Phone">
                {customer.alternatePhone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {customer.dateOfBirth
                  ? formatDate(customer.dateOfBirth)
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {customer.gender
                  ? customer.gender.charAt(0).toUpperCase() +
                    customer.gender.slice(1)
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Nationality">
                {customer.nationality || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="ID Type">
                {customer.idType || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="ID Number">
                {customer.idNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Loyalty Number">
                {customer.loyaltyNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="First Booking Source">
                <Tag>{customer.firstBookingSource?.toUpperCase() || "WEB"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Member Since">
                {formatDate(customer.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Last Booking">
                {customer.lastBookingAt
                  ? formatDate(customer.lastBookingAt)
                  : "Never"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Address & Emergency Contact */}
          <Card
            title={
              <>
                <EnvironmentOutlined /> Address & Emergency Contact
              </>
            }
            className="mb-6"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Title level={5}>Address</Title>
                <div className="mt-2">
                  {customer.addressLine1 && <div>{customer.addressLine1}</div>}
                  {customer.addressLine2 && <div>{customer.addressLine2}</div>}
                  <div>
                    {[customer.city, customer.state, customer.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                  {customer.country && <div>{customer.country}</div>}
                  {!customer.addressLine1 &&
                    !customer.city &&
                    !customer.country && (
                      <Text type="secondary">
                        No address information available
                      </Text>
                    )}
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Title level={5}>Emergency Contact</Title>
                <div className="mt-2">
                  {customer.emergencyContactName && (
                    <div>
                      <Text strong>{customer.emergencyContactName}</Text>
                    </div>
                  )}
                  {customer.emergencyContactPhone && (
                    <div className="mt-1">
                      <Text type="secondary">
                        {customer.emergencyContactPhone}
                      </Text>
                    </div>
                  )}
                  {!customer.emergencyContactName &&
                    !customer.emergencyContactPhone && (
                      <Text type="secondary">
                        No emergency contact information
                      </Text>
                    )}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Preferences & Special Requirements */}
          <Card
            title={
              <>
                <HeartOutlined /> Preferences & Requirements
              </>
            }
            className="mb-6"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Title level={5}>Communication Preferences</Title>
                <div className="mt-2 space-y-2">
                  <div>
                    <Text strong>Preferred Contact: </Text>
                    <Tag>
                      {customer.preferredContactMethod?.toUpperCase() ||
                        "EMAIL"}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Language: </Text>
                    <Tag>
                      {customer.languagePreference?.toUpperCase() || "EN"}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Marketing Opt-in: </Text>
                    <Tag color={customer.marketingOptIn ? "green" : "red"}>
                      {customer.marketingOptIn ? "YES" : "NO"}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Preferred Payment: </Text>
                    <Tag>{customer.preferredPaymentMethod || "N/A"}</Tag>
                  </div>
                  <div>
                    <Text strong>Timezone: </Text>
                    <Tag>{customer.timeZone || "N/A"}</Tag>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <Title level={5}>Special Requirements</Title>
                <div className="mt-2">
                  {customer.dietaryPreferences?.length > 0 && (
                    <div className="mb-3">
                      <Text strong>Dietary Preferences:</Text>
                      <div className="mt-1">
                        {customer.dietaryPreferences.map((pref, index) => (
                          <Tag key={index} color="blue" className="mr-1 mb-1">
                            {pref}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                  {customer.specialRequests?.length > 0 && (
                    <div>
                      <Text strong>Special Requests:</Text>
                      <div className="mt-1">
                        {customer.specialRequests.map((request, index) => (
                          <Tag key={index} color="orange" className="mr-1 mb-1">
                            {request}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                  {!customer.dietaryPreferences?.length &&
                    !customer.specialRequests?.length && (
                      <Text type="secondary">No special requirements</Text>
                    )}
                </div>
              </Col>
            </Row>
          </Card>

          {/* Internal Notes */}
          {customer.notes && (
            <Card
              title={
                <>
                  <InfoCircleOutlined /> Internal Notes
                </>
              }
              className="mb-6"
            >
              <Paragraph className="italic">{customer.notes}</Paragraph>
            </Card>
          )}
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* VIP Status & Loyalty */}
          <Card title="VIP Status & Loyalty" className="mb-6">
            <div className="text-center">
              <CrownOutlined
                style={{
                  fontSize: "48px",
                  color: getVipStatusColor(customer.vipStatus || "regular"),
                }}
                className="mb-3"
              />
              <Title
                level={4}
                style={{
                  color: getVipStatusColor(customer.vipStatus || "regular"),
                }}
              >
                {customer.vipStatus?.toUpperCase() || "REGULAR"}
              </Title>
              <div className="mt-3">
                <Text strong>Total Spent: </Text>
                <Text>{formatCurrency(spendingAnalytics.totalSpentCents)}</Text>
              </div>
              <div className="mt-2">
                <Text strong>Member Since: </Text>
                <Text>{formatDate(customer.createdAt)}</Text>
              </div>
              <div className="mt-2">
                <Text strong>Total Bookings: </Text>
                <Text>{customer.totalBookings}</Text>
              </div>
            </div>
          </Card>

          {/* Spending Summary */}
          <Card
            title={
              <>
                <DollarOutlined /> Spending Summary
              </>
            }
            className="mb-6"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Statistic
                  title="Total Spent"
                  value={spendingAnalytics.totalSpentCents}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(Number(value), "INR")}
                />
              </Col>
              <Col xs={24}>
                <Statistic
                  title="Average Booking Value"
                  value={spendingAnalytics.averageBookingValueCents}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(Number(value), "INR")}
                />
              </Col>
              <Col xs={24}>
                <div>
                  <Text strong>Most Visited Hotel:</Text>
                  <div className="mt-1">
                    {spendingAnalytics.mostVisitedHotel ? (
                      <Text>
                        {spendingAnalytics.mostVisitedHotel.name} (
                        {spendingAnalytics.mostVisitedHotel.visits} visits)
                      </Text>
                    ) : (
                      <Text type="secondary">N/A</Text>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Promo Codes Used */}
          <Card
            title={
              <>
                <TagOutlined /> Promo Codes Used
              </>
            }
            className="mb-6"
          >
            {promoUsage.length > 0 ? (
              <List
                dataSource={promoUsage.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<TagOutlined style={{ color: "#1890ff" }} />}
                      title={
                        <div className="flex justify-between">
                          <Text strong>{item.promoCode.code}</Text>
                          <Text type="success">
                            -
                            {formatCurrency(
                              item.amountCents,
                              item.booking.currencyCode,
                            )}
                          </Text>
                        </div>
                      }
                      description={
                        <div>
                          <Text>Booking: {item.booking.referenceCode}</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            {formatDate(item.usedAt)}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-4">
                <TagOutlined style={{ fontSize: "24px", color: "#d9d9d9" }} />
                <div className="mt-2">
                  <Text type="secondary">No promo codes used yet</Text>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Booking History Tabs */}
      <Card
        title={
          <>
            <CalendarOutlined /> Booking History
          </>
        }
        className="mt-6"
      >
        <Tabs defaultActiveKey="active">
          <TabPane
            tab={
              <Badge count={bookingHistory.active.length} showZero>
                <span className="flex items-center">
                  <ClockCircleOutlined className="mr-1" />
                  Active ({bookingHistory.active.length})
                </span>
              </Badge>
            }
            key="active"
          >
            {bookingHistory.active.length > 0 ? (
              <List
                dataSource={bookingHistory.active}
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
                          style={{ backgroundColor: "#1890ff" }}
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
                            {booking.numAdults} Adults, {booking.numChildren}{" "}
                            Children
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
            ) : (
              <div className="text-center py-8">
                <ClockCircleOutlined
                  style={{ fontSize: "48px", color: "#d9d9d9" }}
                />
                <div className="mt-3">
                  <Text type="secondary">No active bookings</Text>
                </div>
              </div>
            )}
          </TabPane>

          <TabPane
            tab={
              <Badge count={bookingHistory.future.length} showZero>
                <span className="flex items-center">
                  <ExclamationCircleOutlined className="mr-1" />
                  Upcoming ({bookingHistory.future.length})
                </span>
              </Badge>
            }
            key="future"
          >
            {bookingHistory.future.length > 0 ? (
              <List
                dataSource={bookingHistory.future}
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
                          style={{ backgroundColor: "#52c41a" }}
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
                            {booking.numAdults} Adults, {booking.numChildren}{" "}
                            Children
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
            ) : (
              <div className="text-center py-8">
                <ExclamationCircleOutlined
                  style={{ fontSize: "48px", color: "#d9d9d9" }}
                />
                <div className="mt-3">
                  <Text type="secondary">No upcoming bookings</Text>
                </div>
              </div>
            )}
          </TabPane>

          <TabPane
            tab={
              <Badge count={bookingHistory.past.length} showZero>
                <span className="flex items-center">
                  <CheckCircleOutlined className="mr-1" />
                  Past ({bookingHistory.past.length})
                </span>
              </Badge>
            }
            key="past"
          >
            {bookingHistory.past.length > 0 ? (
              <div>
                {/* Toggle between List and Table view */}
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

                {/* Table View for Past Bookings */}
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
                        <Text strong>
                          {formatCurrency(amount, record.currencyCode)}
                        </Text>
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

                {/* Alternative: List View (commented out but available)
                <List
                  dataSource={bookingHistory.past.slice(0, 10)}
                  renderItem={(booking) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                        >
                          View Details
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{ backgroundColor: '#722ed1' }}
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
                              {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                            </div>
                            <div>
                              {booking.numAdults} Adults, {booking.numChildren} Children
                            </div>
                            <div className="mt-1">
                              <Text strong>{formatCurrency(booking.totalAmountCents, booking.currencyCode)}</Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
                */}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircleOutlined
                  style={{ fontSize: "48px", color: "#d9d9d9" }}
                />
                <div className="mt-3">
                  <Text type="secondary">No past bookings</Text>
                </div>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Payment History */}
      <Card
        title={
          <>
            <CreditCardOutlined /> Payment History
          </>
        }
        className="mt-6"
      >
        {paymentHistory.length > 0 ? (
          <List
            dataSource={paymentHistory.slice(0, 10)}
            renderItem={(payment) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ backgroundColor: "#1890ff" }}
                      icon={<CreditCardOutlined />}
                    />
                  }
                  title={
                    <div className="flex justify-between">
                      <Text strong>{payment.bookingReference}</Text>
                      <Space>
                        <Tag color={getStatusColor(payment.status)}>
                          {payment.status?.toUpperCase()}
                        </Tag>
                        <Text type="success" strong>
                          {formatCurrency(
                            payment.amountCents,
                            payment.currencyCode,
                          )}
                        </Text>
                      </Space>
                    </div>
                  }
                  description={
                    <div>
                      <Text>Method: {payment.method}</Text>
                      <Text type="secondary"> • </Text>
                      <Text>Processor: {payment.processor}</Text>
                      <br />
                      <Text type="secondary" className="text-xs">
                        {formatDateTime(payment.createdAt)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="text-center py-8">
            <CreditCardOutlined
              style={{ fontSize: "48px", color: "#d9d9d9" }}
            />
            <div className="mt-3">
              <Text type="secondary">No payment history available</Text>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default CustomerDetails;
