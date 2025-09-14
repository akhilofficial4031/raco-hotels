import { TagOutlined } from "@ant-design/icons";
import { Card, List, Typography } from "antd";
import React from "react";

import { type CustomerDetailsResponse } from "../../../shared/services/customer.service";
import {
  APP_LOCALE,
  LOCALE_DATE_OPTIONS_SHORT,
} from "../../../shared/constants/app";

const { Text } = Typography;

interface PromoCodeUsageProps {
  promoUsage: CustomerDetailsResponse["promoUsage"];
}

const PromoCodeUsage: React.FC<PromoCodeUsageProps> = ({ promoUsage }) => {
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
    <Card
      title={
        <>
          <TagOutlined /> Promo Codes Used
        </>
      }
      className="customer-card"
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
        <div className="text-center py-4 empty-state">
          <TagOutlined style={{ fontSize: "24px", color: "#d9d9d9" }} />
          <div className="mt-2">
            <Text type="secondary">-</Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PromoCodeUsage;
