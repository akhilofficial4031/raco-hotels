/* eslint-disable no-unused-vars */
import { Button, Col, DatePicker, Form, InputNumber, Row, Select } from "antd";
import { type Dayjs } from "dayjs";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";

import { DATE_FORMAT_API } from "../../../shared/constants/app";
import { getHotels } from "../../hotels/services/hotelService";
import { getRoomTypes } from "../../room-type/services/room-type.service";

import type { Hotel } from "../../../shared/models/hotels";
import type { RoomType } from "../../../shared/models/room-type";

interface BookingDetailsFormValues {
  hotelId: number | null;
  roomTypeId: number | null;
  numAdults: number;
  numChildren: number;
  numRooms: number;
  dateRange: [Dayjs, Dayjs] | null;
  status?: string;
  checkInDate?: Dayjs;
  checkOutDate?: Dayjs;
}

interface BookingDetailsFormProps {
  onFinish: (values: BookingDetailsFormValues) => void;
  initialValues?: Partial<BookingDetailsFormValues>;
  mode?: "create" | "edit";
}

const BookingDetailsForm: React.FC<BookingDetailsFormProps> = ({
  onFinish,
  initialValues,
  mode = "create",
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<BookingDetailsFormValues>({
    defaultValues: {
      hotelId: null,
      roomTypeId: null,
      numAdults: 1,
      numChildren: 0,
      numRooms: 1,
      dateRange: null,
      status: "pending",
      ...initialValues,
    },
  });
  const selectedHotelId = watch("hotelId");

  useEffect(() => {
    if (initialValues) {
      reset({
        ...initialValues,
        dateRange: initialValues.dateRange
          ? initialValues.dateRange
          : [initialValues.checkInDate, initialValues.checkOutDate],
      });
    }
  }, [initialValues, reset]);

  const { data: hotelsData } = useSWR(
    mode === "create" ? "/hotels" : null,
    () => getHotels("limit=-1"),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
    },
  );
  const { data: roomTypesData } = useSWR(
    mode === "create" && selectedHotelId
      ? `/room-types?hotelId=${selectedHotelId}`
      : null,
    () => getRoomTypes(`hotelId=${selectedHotelId}&limit=-1`),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 2 * 60 * 1000, // 2 minutes
    },
  );

  return (
    <Form onFinish={handleSubmit(onFinish)} layout="vertical">
      <Row gutter={16}>
        {mode === "create" && (
          <>
            <Col span={12}>
              <Form.Item
                label="Hotel"
                required
                validateStatus={errors.hotelId ? "error" : ""}
                help={errors.hotelId?.message as string}
              >
                <Controller
                  name="hotelId"
                  control={control}
                  rules={{ required: "Hotel is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select a hotel"
                      options={hotelsData?.data.hotels.map((hotel: Hotel) => ({
                        value: hotel.id,
                        label: hotel.name,
                      }))}
                    />
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Room Type"
                required
                validateStatus={errors.roomTypeId ? "error" : ""}
                help={errors.roomTypeId?.message as string}
              >
                <Controller
                  name="roomTypeId"
                  control={control}
                  rules={{ required: "Room type is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Select a room type"
                      disabled={!selectedHotelId}
                      options={roomTypesData?.data.roomTypes.map(
                        (rt: RoomType) => ({
                          value: rt.id,
                          label: rt.name,
                        }),
                      )}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>
      <Row gutter={16}>
        <Col span={4}>
          <Form.Item
            label="Number of Adults"
            required
            validateStatus={errors.numAdults ? "error" : ""}
            help={errors.numAdults?.message as string}
          >
            <Controller
              name="numAdults"
              control={control}
              rules={{ required: "Number of adults is required" }}
              render={({ field }) => (
                <InputNumber {...field} min={1} className="!w-full" />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item
            label="Number of Children"
            validateStatus={errors.numChildren ? "error" : ""}
            help={errors.numChildren?.message as string}
          >
            <Controller
              name="numChildren"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} min={0} className="!w-full" />
              )}
            />
          </Form.Item>
        </Col>
        {mode === "create" && (
          <Col span={4}>
            <Form.Item
              label="Number of Rooms"
              required
              validateStatus={errors.numRooms ? "error" : ""}
              help={errors.numRooms?.message as string}
            >
              <Controller
                name="numRooms"
                control={control}
                rules={{ required: "Number of rooms is required" }}
                render={({ field }) => (
                  <InputNumber {...field} min={1} className="!w-full" />
                )}
              />
            </Form.Item>
          </Col>
        )}
        <Col span={12}>
          <Form.Item
            label="Check-in & Check-out Date"
            required
            validateStatus={errors.dateRange ? "error" : ""}
            help={errors.dateRange?.message as string}
          >
            <Controller
              name="dateRange"
              control={control}
              rules={{ required: "Date range is required" }}
              render={({ field }) => (
                <DatePicker.RangePicker
                  {...field}
                  className="w-full"
                  format={DATE_FORMAT_API}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex justify-end">
        <Button type="primary" htmlType="submit">
          {mode === "create" ? "Check Availability" : "Next"}
        </Button>
      </div>
    </Form>
  );
};

export default BookingDetailsForm;
