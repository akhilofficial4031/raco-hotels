/* eslint-disable no-unused-vars */
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Row, Col, Space, message, Select } from "antd";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { nationalities } from "@utils/nationalities";

import { findCustomerByPhone } from "../../customer/services/customerService";
import { type CustomerData, CustomerDataSchema } from "../types/schemas";

const { TextArea } = Input;

interface CustomerInformationFormProps {
  onNext: (data: CustomerData) => void;
  onBack: () => void;
  initialData?: CustomerData;
}

const CustomerInformationForm = ({
  onNext,
  onBack,
  initialData,
}: CustomerInformationFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CustomerData>({
    resolver: zodResolver(CustomerDataSchema),
    defaultValues: initialData ?? { nationality: "Indian" },
  });

  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [lastSearchedPhone, setLastSearchedPhone] = useState<string>("");

  // Phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone number validation - at least 7 digits, can include spaces, dashes, parentheses, plus signs
    const phoneRegex = /^[+]?[\d\s\-()]{7,}$/;
    return phoneRegex.test(phone.trim());
  };

  // Search customer by phone number
  const searchCustomerByPhone = async (phone: string) => {
    if (!phone.trim() || !validatePhoneNumber(phone)) {
      return;
    }

    // Don't search if we already searched this phone number
    if (lastSearchedPhone === phone.trim()) {
      return;
    }

    setIsSearchingCustomer(true);
    setLastSearchedPhone(phone.trim());

    try {
      const response = await findCustomerByPhone(phone.trim());

      if (response.data.found && response.data.customer) {
        const customer = response.data.customer;

        // Map customer data to form fields
        const formData: Partial<CustomerData> = {
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          alternatePhone: customer.alternatePhone || "",
          nationality: customer.nationality || "",
          idType: customer.idType || "",
          idNumber: customer.idNumber || "",
          emergencyContactName: customer.emergencyContactName || "",
          emergencyContactPhone: customer.emergencyContactPhone || "",
          notes: customer.notes || "",
        };

        // Populate form fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            setValue(key as keyof CustomerData, value);
          }
        });

        message.success("Customer found and form populated with existing data");
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      message.error("Failed to search customer. Please try again.");
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  // Handle phone number blur
  const handlePhoneBlur = (phone: string) => {
    searchCustomerByPhone(phone);
  };

  const onSubmit = (data: CustomerData) => {
    data.firstBookingSource = "front_office";
    onNext(data);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <h2 style={{ marginBottom: "24px" }}>Primary Contact Information</h2>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label={
              <Space>
                Phone Number
                {isSearchingCustomer && (
                  <span style={{ fontSize: "12px", color: "#1890ff" }}>
                    Searching...
                  </span>
                )}
              </Space>
            }
            required
            validateStatus={errors.phone ? "error" : ""}
            help={errors.phone?.message}
          >
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter customer's phone number"
                  onBlur={(e) => handlePhoneBlur(e.target.value)}
                  disabled={isSearchingCustomer}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Full Name"
            required
            validateStatus={errors.fullName ? "error" : ""}
            help={errors.fullName?.message}
          >
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter customer's full name" />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label="Email"
            required
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter customer's email"
                  type="email"
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Alternate Phone Number">
            <Controller
              name="alternatePhone"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter alternate phone number" />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <h2 style={{ marginTop: "32px", marginBottom: "24px" }}>
        Identification
      </h2>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="Nationality">
            <Controller
              name="nationality"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select nationality" showSearch>
                  {nationalities.map((nationality) => (
                    <Select.Option key={nationality} value={nationality}>
                      {nationality}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label="ID Type"
            required
            validateStatus={errors.idType ? "error" : ""}
            help={errors.idType?.message}
          >
            <Controller
              name="idType"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g., Passport, Driving License"
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="ID Number"
            required
            validateStatus={errors.idNumber ? "error" : ""}
            help={errors.idNumber?.message}
          >
            <Controller
              name="idNumber"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter ID number" />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <h2 style={{ marginTop: "32px", marginBottom: "24px" }}>
        Emergency Contact
      </h2>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item label="Emergency Contact Name">
            <Controller
              name="emergencyContactName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter emergency contact name" />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Emergency Contact Phone">
            <Controller
              name="emergencyContactPhone"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter emergency contact phone" />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <h2 style={{ marginTop: "32px", marginBottom: "24px" }}>
        Other Information
      </h2>
      <Row>
        <Col span={24}>
          <Form.Item label="Notes">
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  rows={4}
                  placeholder="Any additional notes"
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ marginTop: "32px", textAlign: "right" }}>
        <Space>
          <Button onClick={onBack}>Back</Button>
          <Button type="primary" htmlType="submit">
            Next
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CustomerInformationForm;
