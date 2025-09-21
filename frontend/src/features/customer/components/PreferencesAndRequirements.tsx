import { HeartOutlined } from "@ant-design/icons";
import { Card, Col, Row, Tag, Typography } from "antd";
import React from "react";

import { type CustomerDetailsResponse } from "../services/customerService";

const { Title, Text } = Typography;

interface PreferencesAndRequirementsProps {
  customer: CustomerDetailsResponse["customer"];
}

const PreferencesAndRequirements: React.FC<PreferencesAndRequirementsProps> = ({
  customer,
}) => {
  return (
    <Card
      title={
        <>
          <HeartOutlined /> Preferences & Requirements
        </>
      }
      className="customer-card"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Title level={5} className="section-heading">
            Communication Preferences
          </Title>
          <div className="mt-2 space-y-2 data-group">
            <div>
              <Text strong>Preferred Contact: </Text>
              <Tag>
                {customer.preferredContactMethod?.toUpperCase() || "EMAIL"}
              </Tag>
            </div>
            <div>
              <Text strong>Language: </Text>
              <Tag>{customer.languagePreference?.toUpperCase() || "EN"}</Tag>
            </div>
            <div>
              <Text strong>Marketing Opt-in: </Text>
              <Tag color={customer.marketingOptIn ? "green" : "red"}>
                {customer.marketingOptIn ? "YES" : "NO"}
              </Tag>
            </div>
            <div>
              <Text strong>Preferred Payment: </Text>
              <Tag>{customer.preferredPaymentMethod || "-"}</Tag>
            </div>
            <div>
              <Text strong>Timezone: </Text>
              <Tag>{customer.timeZone || "-"}</Tag>
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <Title level={5} className="section-heading">
            Special Requirements
          </Title>
          <div className="mt-2 data-group">
            {customer.dietaryPreferences &&
              customer.dietaryPreferences.length > 0 && (
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
            {customer.specialRequests &&
              customer.specialRequests.length > 0 && (
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
            {(!customer.dietaryPreferences ||
              customer.dietaryPreferences.length === 0) &&
              (!customer.specialRequests ||
                customer.specialRequests.length === 0) && (
                <Text type="secondary">-</Text>
              )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default PreferencesAndRequirements;
