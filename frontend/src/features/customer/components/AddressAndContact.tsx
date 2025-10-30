import { EnvironmentOutlined } from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";
import React from "react";

import { type CustomerDetailsResponse } from "../services/customerService";

const { Title, Text } = Typography;

interface AddressAndContactProps {
  customer: CustomerDetailsResponse["customer"];
}

const AddressAndContact: React.FC<AddressAndContactProps> = ({ customer }) => {
  return (
    <Card
      title={
        <>
          <EnvironmentOutlined /> Address & Emergency Contact
        </>
      }
      className="customer-card"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Title level={5} className="section-heading">
            Address
          </Title>
          <div className="mt-2 data-group">
            {customer.addressLine1 && <div>{customer.addressLine1}</div>}
            {customer.addressLine2 && <div>{customer.addressLine2}</div>}
            <div>
              {[customer.city, customer.state, customer.postalCode]
                .filter(Boolean)
                .join(", ")}
            </div>
            {customer.country && <div>{customer.country}</div>}
            {!customer.addressLine1 && !customer.city && !customer.country && (
              <Text type="secondary">-</Text>
            )}
          </div>
        </Col>
        <Col xs={24} md={12}>
          <Title level={5} className="section-heading">
            Emergency Contact
          </Title>
          <div className="mt-2 data-group">
            {customer.emergencyContactName && (
              <div>
                <Text strong>{customer.emergencyContactName}</Text>
              </div>
            )}
            {customer.emergencyContactPhone && (
              <div className="mt-1">
                <Text type="secondary">{customer.emergencyContactPhone}</Text>
              </div>
            )}
            {!customer.emergencyContactName &&
              !customer.emergencyContactPhone && (
                <Text type="secondary">-</Text>
              )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default AddressAndContact;
