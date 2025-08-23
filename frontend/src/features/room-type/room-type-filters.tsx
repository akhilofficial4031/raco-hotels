import { Button, Drawer, Form, Select, Space, Typography } from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";

import { type Hotel } from "../../shared/models/hotels";
import { type RoomTypeListParamStructure } from "../../shared/models/room-type";
import { fetcher } from "../../utils/swrFetcher";

const { Option } = Select;
const { Title } = Typography;

interface RoomTypeFiltersProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Partial<RoomTypeListParamStructure>) => void;
  currentFilters: RoomTypeListParamStructure;
}

interface FilterFormData {
  hotelId?: string;
  isActive?: string;
}

const RoomTypeFilters: React.FC<RoomTypeFiltersProps> = ({
  open,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const { control, handleSubmit, reset, watch } = useForm<FilterFormData>({
    defaultValues: {
      hotelId: currentFilters.hotelId || undefined,
      isActive: currentFilters.isActive || undefined,
    },
  });

  // Fetch hotels for filter dropdown
  const { data: hotelsResponse } = useSWR(
    "/hotels?limit=100",
    fetcher<{ data: { hotels: Hotel[] } }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  // Watch form values to detect changes
  const watchedValues = watch();

  const handleApplyFilters = (data: FilterFormData) => {
    onApplyFilters({
      hotelId: data.hotelId || "",
      isActive: data.isActive || "",
      page: 1, // Reset to first page when applying filters
    });
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      hotelId: "",
      isActive: "",
      page: 1,
    };
    reset({
      hotelId: undefined,
      isActive: undefined,
    });
    onApplyFilters(clearedFilters);
    onClose();
  };

  const hasActiveFilters = Boolean(
    watchedValues.hotelId || watchedValues.isActive,
  );

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <Title level={4} className="!mb-0">
            Filter Room Types
          </Title>
        </div>
      }
      width={400}
      onClose={onClose}
      open={open}
      afterOpenChange={(visible) => {
        if (visible) {
          reset({
            hotelId: currentFilters.hotelId || undefined,
            isActive: currentFilters.isActive || undefined,
          });
        }
      }}
      footer={
        <Space className="w-full justify-between">
          <Button onClick={handleClearFilters} disabled={!hasActiveFilters}>
            Clear All
          </Button>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit(handleApplyFilters)}
              disabled={!hasActiveFilters}
            >
              Apply Filters
            </Button>
          </Space>
        </Space>
      }
    >
      <Form layout="vertical" onFinish={handleSubmit(handleApplyFilters)}>
        <Form.Item label="Hotel">
          <Controller
            name="hotelId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select a hotel"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {hotelsResponse?.data?.hotels?.map((hotel) => (
                  <Option key={hotel.id} value={hotel.id.toString()}>
                    {hotel.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item label="Status">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select status" allowClear>
                <Option value="1">Active</Option>
                <Option value="0">Inactive</Option>
              </Select>
            )}
          />
        </Form.Item>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Typography.Text type="secondary" className="text-sm">
            <strong>Active Filters:</strong>
          </Typography.Text>
          <div className="mt-2 space-y-1">
            {watchedValues.hotelId && (
              <div className="text-sm">
                <span className="font-medium">Hotel:</span>{" "}
                {
                  hotelsResponse?.data?.hotels?.find(
                    (h) => h.id.toString() === watchedValues.hotelId,
                  )?.name
                }
              </div>
            )}
            {watchedValues.isActive && (
              <div className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                {watchedValues.isActive === "1" ? "Active" : "Inactive"}
              </div>
            )}
            {!hasActiveFilters && (
              <Typography.Text type="secondary" className="text-sm">
                No filters applied
              </Typography.Text>
            )}
          </div>
        </div>
      </Form>
    </Drawer>
  );
};

export default RoomTypeFilters;
