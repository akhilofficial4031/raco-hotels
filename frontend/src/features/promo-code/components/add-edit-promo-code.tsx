/* eslint-disable no-unused-vars */
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import useSWR from "swr";

import { type Hotel } from "../../../shared/models/hotels";
import {
  type CreatePromoCodePayload,
  type PromoCodeWithRelations,
} from "../../../shared/models/promo-code";
import { fetcher } from "../../../utils/swrFetcher";

const { RangePicker } = DatePicker;

interface AddEditPromoCodeProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePromoCodePayload) => void;
  promoCode: PromoCodeWithRelations | null;
  isSaving: boolean;
}

const AddEditPromoCode: React.FC<AddEditPromoCodeProps> = ({
  open,
  onClose,
  onSubmit,
  promoCode,
  isSaving,
}) => {
  const [form] = Form.useForm();

  const { data: hotelsResponse } = useSWR(
    "/hotels?limit=100",
    fetcher<{ data: { hotels: Hotel[] } }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    if (promoCode) {
      form.setFieldsValue({
        ...promoCode,
        dateRange:
          promoCode.startDate && promoCode.endDate
            ? [dayjs(promoCode.startDate), dayjs(promoCode.endDate)]
            : undefined,
        isActive: promoCode.isActive === 1,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true, type: "percent" });
    }
  }, [promoCode, form, open]);

  const handleFinish = (values: any) => {
    const { dateRange, ...rest } = values;
    const payload: CreatePromoCodePayload = {
      ...rest,
      isActive: values.isActive ? 1 : 0,
      startDate: dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined,
      endDate: dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined,
    };
    onSubmit(payload);
  };

  return (
    <Drawer
      title={promoCode ? "Edit Promo Code" : "Add Promo Code"}
      width={720}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()}
            type="primary"
            loading={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      }
    >
      <Form layout="vertical" onFinish={handleFinish} form={form}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hotelId"
              label="Hotel"
              rules={[{ required: true, message: "Please select a hotel" }]}
            >
              <Select
                placeholder="Select a hotel"
                options={hotelsResponse?.data.hotels.map((hotel) => ({
                  label: hotel.name,
                  value: hotel.id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="code"
              label="Promo Code"
              rules={[
                { required: true, message: "Please enter the promo code" },
              ]}
            >
              <Input placeholder="e.g. SUMMER20" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Discount Type"
              rules={[
                { required: true, message: "Please select a discount type" },
              ]}
            >
              <Select
                options={[
                  { label: "Percentage", value: "percent" },
                  { label: "Fixed Amount", value: "fixed" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="value"
              label="Discount Value"
              rules={[
                { required: true, message: "Please enter the discount value" },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                addonAfter={
                  form.getFieldValue("type") === "percent" ? "%" : "₹"
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="dateRange" label="Validity Dates">
              <RangePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item name="isActive" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default AddEditPromoCode;
