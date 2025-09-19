import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";

import { DATE_FORMAT_API } from "../../../shared/constants/app";
import { BOOKING_STATUS } from "../../../shared/constants/bookings";
import { type BookingListParamStructure } from "../../../shared/models/bookings";
import { type Hotel } from "../../../shared/models/hotels";
import { fetcher } from "../../../utils/swrFetcher";

const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

// Convert BOOKING_STATUS object to array of options
const bookingStatusOptions = Object.entries(BOOKING_STATUS).map(
  ([key, value]) => ({
    value,
    label: key
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" "),
  }),
);

interface BookingFiltersProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onApplyFilters: (filters: Partial<BookingListParamStructure>) => void;
  currentFilters: BookingListParamStructure;
}

interface FilterFormData {
  hotelId?: string;
  status?: string;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
  open,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  const { control, handleSubmit, reset } = useForm<FilterFormData>({
    defaultValues: {
      hotelId: currentFilters.hotelId || undefined,
      status: currentFilters.status || undefined,
      dateRange:
        currentFilters.checkInDateStart && currentFilters.checkInDateEnd
          ? [
              dayjs(currentFilters.checkInDateStart),
              dayjs(currentFilters.checkInDateEnd),
            ]
          : null,
    },
  });

  const { data: hotelsResponse } = useSWR(
    open ? "/hotels?limit=100" : null,
    fetcher<{ data: { hotels: Hotel[] } }>,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  );

  const handleApplyFilters = (data: FilterFormData) => {
    onApplyFilters({
      hotelId: data.hotelId || "",
      status: data.status || "",
      checkInDateStart: data.dateRange
        ? data.dateRange[0].format(DATE_FORMAT_API)
        : undefined,
      checkInDateEnd: data.dateRange
        ? data.dateRange[1].format(DATE_FORMAT_API)
        : undefined,
      page: 1,
    });
    onClose();
  };

  const handleClearFilters = () => {
    reset({
      hotelId: undefined,
      status: undefined,
      dateRange: null,
    });
    onApplyFilters({
      hotelId: "",
      status: "",
      checkInDateStart: undefined,
      checkInDateEnd: undefined,
      page: 1,
    });
    onClose();
  };

  return (
    <Drawer
      title={<Title level={4}>Filter Bookings</Title>}
      width={400}
      onClose={onClose}
      open={open}
      footer={
        <Space className="w-full justify-end">
          <Button onClick={handleClearFilters}>Clear All</Button>
          <Button type="primary" onClick={handleSubmit(handleApplyFilters)}>
            Apply Filters
          </Button>
        </Space>
      }
    >
      <Form layout="vertical">
        <Form.Item label="Hotel">
          <Controller
            name="hotelId"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select a hotel" allowClear>
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
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select status" allowClear>
                {bookingStatusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item label="Check-in Date">
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <RangePicker
                {...field}
                className="w-full"
                format={DATE_FORMAT_API}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default BookingFilters;
