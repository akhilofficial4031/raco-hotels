/* eslint-disable no-unused-vars */
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Row, Col, Space } from "antd";
import { useForm, Controller } from "react-hook-form";

import { type CustomerData, CustomerDataSchema } from "./schemas";

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
  } = useForm<CustomerData>({
    resolver: zodResolver(CustomerDataSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: CustomerData) => {
    console.log(data);
    onNext(data);
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <h2 style={{ marginBottom: "24px" }}>Primary Contact Information</h2>
      <Row gutter={24}>
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
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            label="Phone Number"
            required
            validateStatus={errors.phone ? "error" : ""}
            help={errors.phone?.message}
          >
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter customer's phone number" />
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
                <Input {...field} placeholder="Enter nationality" />
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
