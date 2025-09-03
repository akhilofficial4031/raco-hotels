import { UserOutlined } from "@ant-design/icons";
import { Card, Descriptions, Tag } from "antd";
import React from "react";

import { type CustomerDetailsResponse } from "../../../shared/services/customer.service";

interface PersonalInformationProps {
  customer: CustomerDetailsResponse["customer"];
}

const PersonalInformation: React.FC<PersonalInformationProps> = ({
  customer,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      title={
        <>
          <UserOutlined /> Personal Information
        </>
      }
      className="customer-card"
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Full Name">
          {customer.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">
          {customer.phone || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Alternate Phone">
          {customer.alternatePhone || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Date of Birth">
          {customer.dateOfBirth ? formatDate(customer.dateOfBirth) : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Gender">
          {customer.gender
            ? customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1)
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Nationality">
          {customer.nationality || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="ID Type">
          {customer.idType || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="ID Number">
          {customer.idNumber || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Loyalty Number">
          {customer.loyaltyNumber || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="First Booking Source">
          <Tag>{customer.firstBookingSource?.toUpperCase() || "WEB"}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Member Since">
          {formatDate(customer.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Last Booking">
          {customer.lastBookingAt ? formatDate(customer.lastBookingAt) : "-"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default PersonalInformation;
