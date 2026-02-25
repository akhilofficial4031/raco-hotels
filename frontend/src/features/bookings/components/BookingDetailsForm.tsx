/* eslint-disable no-unused-vars */
import { Button, Col, DatePicker, Form, InputNumber, Row, Select, Tooltip, message } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { type Dayjs } from "dayjs";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";

import { DATE_FORMAT_API } from "@shared/constants/app";

import { getHotels } from "../../hotels/services/hotelService";
import { getRoomTypes } from "../../room-type/services/roomTypeService";

import type { Hotel } from "../../hotels/types/hotels";
import type { RoomType } from "../../room-type/types/roomType";


interface BookingDetailsFormValues {
  hotelId: number | null;
  roomTypeId: number | null;
  numAdults: number;
  numChildren: number;
  childrenAges: { age: number }[];
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
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<BookingDetailsFormValues>({
    defaultValues: {
      hotelId: null,
      roomTypeId: null,
      numAdults: 1,
      numChildren: 0,
      childrenAges: [],
      numRooms: 1,
      dateRange: null,
      status: "pending",
      ...initialValues,
    },
  });

  const { fields: childrenAgeFields, replace: replaceChildrenAges } =
    useFieldArray({ control, name: "childrenAges" });

  const selectedHotelId = watch("hotelId");
  const numChildren = watch("numChildren");
  const watchedRoomTypeId = watch("roomTypeId");
  const watchedNumAdults = watch("numAdults");
  const watchedNumRooms = watch("numRooms");

  // Clear occupancy error when adults or rooms count changes
  useEffect(() => {
    clearErrors("numAdults");
  }, [watchedNumAdults, watchedNumRooms, watchedRoomTypeId, clearErrors]);

  useEffect(() => {
    if (initialValues) {
      reset({
        ...initialValues,
        childrenAges: initialValues.childrenAges ?? [],
        dateRange: initialValues.dateRange
          ? initialValues.dateRange
          : [initialValues.checkInDate, initialValues.checkOutDate],
      });
    }
  }, [initialValues, reset]);

  // Sync childrenAges array length with numChildren count
  useEffect(() => {
    const count = numChildren ?? 0;
    replaceChildrenAges(
      Array.from({ length: count }, (_, i) => ({
        age: childrenAgeFields[i]?.age ?? 0,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numChildren]);

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

  const handleSubmitWithOccupancyCheck = (values: BookingDetailsFormValues) => {
    if (mode === "create" && values.roomTypeId && values.numRooms) {
      const selectedRoomType = roomTypesData?.data.roomTypes.find(
        (rt: RoomType) => rt.id === values.roomTypeId,
      );

      if (selectedRoomType) {
        const maxAllowed = selectedRoomType.maxOccupancy * values.numRooms;
        const isOccupancyBlocked = values.numAdults >= maxAllowed + 2;
        const hasExtraAdult = values.numAdults === maxAllowed + 1;

        if (isOccupancyBlocked) {
          setError("numAdults", {
            type: "manual",
            message: `Exceeds max occupancy. Max ${selectedRoomType.maxOccupancy} adults per room (${maxAllowed} total for ${values.numRooms} room(s)). Please increase rooms or reduce adults.`,
          });
          return;
        }

        if (hasExtraAdult) {
          void message.info(
            `One extra adult detected. An additional charge of ₹${(selectedRoomType.extraAdultChargeCents / 100).toLocaleString()} + 5% tax will be applied at checkout.`,
            6,
          );
        }
      }
    }

    onFinish(values);
  };

  return (
    <Form onFinish={handleSubmit(handleSubmitWithOccupancyCheck)} layout="vertical">
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
            label="Adults"
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
            label={
              <div className="flex items-center gap-2">
                Children
                <Tooltip title="Enter count of guests under age 10. Children are free and do not affect room capacity.">
                  <InfoCircleOutlined className="text-gray-400" />
                </Tooltip>
              </div>
            }
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
              label="Rooms"
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

      {childrenAgeFields.length > 0 && (
        <Row gutter={16}>
          {childrenAgeFields.map((field, index) => (
            <Col key={field.id} span={4}>
              <Form.Item
                label={`Child ${index + 1} Age`}
                validateStatus={
                  errors.childrenAges?.[index]?.age ? "error" : ""
                }
                help={errors.childrenAges?.[index]?.age?.message as string}
              >
                <Controller
                  name={`childrenAges.${index}.age`}
                  control={control}
                  rules={{
                    required: "Age is required",
                    min: { value: 0, message: "Age must be 0 or above" },
                    max: { value: 17, message: "Age must be 17 or below" },
                  }}
                  render={({ field: ageField }) => (
                    <InputNumber
                      {...ageField}
                      min={0}
                      max={17}
                      placeholder="0–17"
                      className="!w-full"
                    />
                  )}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>
      )}

      <div className="flex justify-end">
        <Button type="primary" htmlType="submit">
          {mode === "create" ? "Check Availability" : "Next"}
        </Button>
      </div>
    </Form>
  );
};

export default BookingDetailsForm;
