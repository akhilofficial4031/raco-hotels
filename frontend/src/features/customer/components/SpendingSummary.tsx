import { DollarOutlined, CrownOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography } from "antd";
import React from "react";

import { type CustomerDetailsResponse } from "../../../shared/services/customer.service";
import {
  APP_LOCALE,
  LOCALE_DATE_OPTIONS_SHORT,
} from "../../../shared/constants/app";

const { Title, Text } = Typography;

interface SpendingSummaryProps {
  customer: CustomerDetailsResponse["customer"];
  spendingAnalytics: CustomerDetailsResponse["spendingAnalytics"];
}

const SpendingSummary: React.FC<SpendingSummaryProps> = ({
  customer,
  spendingAnalytics,
}) => {
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
    return new Date(dateString).toLocaleDateString(
      APP_LOCALE,
      LOCALE_DATE_OPTIONS_SHORT,
    );
  };

  return (
    <>
      {/* VIP Status & Loyalty */}
      <Card title="VIP Status & Loyalty" className="customer-card">
        <div className="text-center data-group">
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
        className="customer-card"
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
                  <Text type="secondary">-</Text>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default SpendingSummary;
