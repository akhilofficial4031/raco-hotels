import { CreditCardOutlined } from "@ant-design/icons";
import { Avatar, Card, List, Space, Tag, Typography } from "antd";
import React from "react";

import { type CustomerDetailsResponse } from "../../../shared/services/customer.service";

const { Text } = Typography;

interface PaymentHistoryProps {
  paymentHistory: CustomerDetailsResponse["paymentHistory"];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ paymentHistory }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "green";
      case "pending":
        return "gold";
      case "failed":
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card
      title={
        <>
          <CreditCardOutlined /> Payment History
        </>
      }
      className="customer-card"
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
        <div className="text-center py-8 empty-state">
          <CreditCardOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <div className="mt-3">
            <Text type="secondary">-</Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PaymentHistory;
