import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  Breadcrumb,
  message,
  Spin,
  Row,
  Col,
  Switch,
  InputNumber,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import useSWR from "swr";

import Spinner from "../shared/components/Spinner";
import { type ApiResponse } from "../shared/models";
import {
  getCustomerById,
  updateCustomerById,
} from "../shared/services/customer.service";
import { type Customer } from "../shared/services/customer.service";
import { fetcher } from "../utils/swrFetcher";

const { Title } = Typography;
const { TextArea } = Input;

function EditCustomer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<ApiResponse<Customer>>(id ? `/customers/${id}` : null, fetcher);

  const customer = response?.data;

  useEffect(() => {
    if (customer) {
      form.setFieldsValue({
        ...customer,
        loyaltyPoints: 0, // Placeholder
      });
    }
  }, [customer, form]);

  const onFinish = async (values: any) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const payload: Partial<Customer> = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        alternatePhone: values.alternatePhone,
        nationality: values.nationality,
        idType: values.idType,
        idNumber: values.idNumber,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        notes: values.notes,
      };
      const apiResponse = await updateCustomerById(id, payload);
      if (apiResponse.success) {
        message.success("Customer updated successfully!");
        navigate(`/customers/${id}`);
      } else {
        message.error("Failed to update customer.");
      }
    } catch (err) {
      message.error("An error occurred while updating the customer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Failed to load customer data.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-4 rounded-lg mb-2 border border-gray-200">
        <div>
          <Title level={4} className="!m-0">
            Edit Customer #{customer?.id}
          </Title>
          <Breadcrumb
            className="mt-2"
            items={[
              { title: <Link to="/dashboard">Dashboard</Link> },
              { title: <Link to="/customers">Customers</Link> },
              { title: "Edit Customer" },
            ]}
          />
        </div>
      </div>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Title level={5}>Personal Information</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="alternatePhone" label="Alternate Phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nationality" label="Nationality">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="idType" label="ID Type">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="idNumber" label="ID Number">
            <Input />
          </Form.Item>

          <Title level={5} className="mt-6">
            Address
          </Title>
          <p className="text-gray-500 mb-4">
            Address fields are not yet available. Backend implementation is
            required.
          </p>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="addressLine1" label="Address Line 1">
                <Input disabled placeholder="Backend implementation needed" />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} className="mt-6">
            Emergency Contact
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="emergencyContactName"
                label="Emergency Contact Name"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emergencyContactPhone"
                label="Emergency Contact Phone"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} className="mt-6">
            Other Details
          </Title>
          <Row gutter={16} align="middle">
            <Col span={12}>
              <Form.Item
                name="vipStatus"
                label="VIP Status"
                valuePropName="checked"
              >
                <Switch disabled />
              </Form.Item>
              <p className="text-gray-500 -mt-4 mb-4">
                Backend implementation needed.
              </p>
            </Col>
            <Col span={12}>
              <Form.Item name="loyaltyPoints" label="Loyalty Points">
                <InputNumber disabled style={{ width: "100%" }} />
              </Form.Item>
              <p className="text-gray-500 -mt-4 mb-4">
                Backend implementation needed.
              </p>
            </Col>
          </Row>

          <Form.Item name="notes" label="Preferences and Requirements">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Save Changes
            </Button>
            <Button
              className="ml-2"
              onClick={() => navigate(`/customers/${id}`)}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default EditCustomer;
