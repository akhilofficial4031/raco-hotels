import {
  MoreOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
  CrownOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Space, Tag, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router";

import { type CustomerDetailsResponse } from "../services/customerService";

const { Title, Text } = Typography;

interface CustomerHeaderProps {
  customer: CustomerDetailsResponse["customer"];
  currentBooking?: CustomerDetailsResponse["currentBooking"];
  customerId: string;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customer,
  currentBooking,
  customerId,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "green";
      case "inactive":
        return "orange";
      case "blocked":
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

  const menuItems = [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      onClick: () => navigate(`/customers/${customerId}/edit`),
    },
    {
      key: "new-booking",
      icon: <PlusOutlined />,
      label: "Create Booking",
      onClick: () => navigate(`/bookings/create?customerId=${customerId}`),
    },
    {
      key: "email",
      icon: <MailOutlined />,
      label: "Send Email",
    },
    {
      key: "call",
      icon: <PhoneOutlined />,
      label: "Call Customer",
    },
  ];

  return (
    <div className="flex justify-between items-center bg-white p-6 rounded-lg mb-6 border border-gray-200 shadow-sm customer-header">
      <div className="flex items-center space-x-4 data-group">
        <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
        <div className="pl-3">
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
            </Space>
          </div>
        </div>
      </div>
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <Button icon={<MoreOutlined />} size="large" />
      </Dropdown>
    </div>
  );
};

export default CustomerHeader;
