/* eslint-disable no-unused-vars */
import { Button, Drawer, Form, Select, DatePicker } from "antd";
import { useEffect } from "react";
import useSWR from "swr";

import { type Hotel } from "../../../shared/models/hotels";
import { type PromoCodeListParamStructure } from "../../../shared/models/promo-code";
import { fetcher } from "../../../utils/swrFetcher";

const { RangePicker } = DatePicker;

interface PromoCodeFiltersProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Partial<PromoCodeListParamStructure>) => void;
  currentFilters: PromoCodeListParamStructure;
}

const PromoCodeFilters: React.FC<PromoCodeFiltersProps> = ({
  open,
  onClose,
  onApplyFilters,
  currentFilters,
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
    form.setFieldsValue(currentFilters);
  }, [currentFilters, form]);

  const handleFinish = (values: any) => {
    onApplyFilters(values);
    onClose();
  };

  const handleReset = () => {
    form.resetFields();
    onApplyFilters({
      hotelId: "",
      isActive: "",
      dateRange: null,
    });
    onClose();
  };

  return (
    <Drawer
      title="Filter Promo Codes"
      width={360}
      onClose={onClose}
      open={open}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={handleReset} style={{ marginRight: 8 }}>
            Reset
          </Button>
          <Button onClick={() => form.submit()} type="primary">
            Apply
          </Button>
        </div>
      }
    >
      <Form layout="vertical" onFinish={handleFinish} form={form}>
        <Form.Item name="hotelId" label="Hotel">
          <Select
            placeholder="Select a hotel"
            allowClear
            options={hotelsResponse?.data.hotels.map((hotel) => ({
              label: hotel.name,
              value: hotel.id,
            }))}
          />
        </Form.Item>
        <Form.Item name="isActive" label="Status">
          <Select
            placeholder="Select a status"
            allowClear
            options={[
              { label: "Active", value: "1" },
              { label: "Inactive", value: "0" },
            ]}
          />
        </Form.Item>
        <Form.Item name="dateRange" label="Validity Dates">
          <RangePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default PromoCodeFilters;
