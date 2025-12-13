import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Select,
  Space,
  Typography,
} from "antd";
import { Controller, useForm } from "react-hook-form";

import { type InquiryListParamStructure } from "../types/inquiry";

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

interface InquiryFiltersProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onApplyFilters: (filters: Partial<InquiryListParamStructure>) => void;
  currentFilters: InquiryListParamStructure;
}

interface FilterFormData {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

const InquiryFilters: React.FC<InquiryFiltersProps> = ({
  open,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const { control, handleSubmit, reset, watch } = useForm<FilterFormData>({
    defaultValues: {
      status: currentFilters.status || undefined,
      dateFrom: currentFilters.dateFrom || undefined,
      dateTo: currentFilters.dateTo || undefined,
    },
  });

  // Watch form values to detect changes
  const watchedValues = watch();

  const handleApplyFilters = (data: FilterFormData) => {
    onApplyFilters({
      status: data.status || "",
      dateFrom: data.dateFrom || "",
      dateTo: data.dateTo || "",
      page: 1, // Reset to first page when applying filters
    });
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      status: "",
      dateFrom: "",
      dateTo: "",
      page: 1,
    };
    reset({
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
    onApplyFilters(clearedFilters);
    onClose();
  };

  const hasActiveFilters = Boolean(
    watchedValues.status || watchedValues.dateFrom || watchedValues.dateTo,
  );

  const formatDateRange = (from?: string, to?: string) => {
    if (!from && !to) return null;
    if (from && to)
      return `${new Date(from).toLocaleDateString()} - ${new Date(to).toLocaleDateString()}`;
    if (from) return `From ${new Date(from).toLocaleDateString()}`;
    if (to) return `Until ${new Date(to).toLocaleDateString()}`;
    return null;
  };

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <Title level={4} className="!mb-0">
            Filter Inquiries
          </Title>
        </div>
      }
      width={400}
      onClose={onClose}
      open={open}
      afterOpenChange={(visible) => {
        if (visible) {
          reset({
            status: currentFilters.status || undefined,
            dateFrom: currentFilters.dateFrom || undefined,
            dateTo: currentFilters.dateTo || undefined,
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
        <Form.Item label="Status">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select status" allowClear>
                <Option value="pending">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2 bg-orange-500" />
                    Pending
                  </div>
                </Option>
                <Option value="addressed">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2 bg-blue-500" />
                    Addressed
                  </div>
                </Option>
                <Option value="confirmed">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                    Confirmed
                  </div>
                </Option>
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item label="Date Range">
          <Controller
            name="dateFrom"
            control={control}
            render={({ field }) => (
              <RangePicker
                className="w-full"
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    field.onChange(dates[0].toISOString());
                    // We need to update dateTo through the form
                    reset({
                      ...watchedValues,
                      dateFrom: dates[0].toISOString(),
                      dateTo: dates[1].toISOString(),
                    });
                  } else {
                    field.onChange(undefined);
                    reset({
                      ...watchedValues,
                      dateFrom: undefined,
                      dateTo: undefined,
                    });
                  }
                }}
                placeholder={["Start Date", "End Date"]}
              />
            )}
          />
        </Form.Item>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <Typography.Text type="secondary" className="text-sm">
            <strong>Active Filters:</strong>
          </Typography.Text>
          <div className="mt-2 space-y-1">
            {watchedValues.status && (
              <div className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                {watchedValues.status.charAt(0).toUpperCase() +
                  watchedValues.status.slice(1)}
              </div>
            )}
            {(watchedValues.dateFrom || watchedValues.dateTo) && (
              <div className="text-sm">
                <span className="font-medium">Date Range:</span>{" "}
                {formatDateRange(watchedValues.dateFrom, watchedValues.dateTo)}
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

export default InquiryFilters;
