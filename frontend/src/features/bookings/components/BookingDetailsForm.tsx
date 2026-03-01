/* eslint-disable no-unused-vars */
import { InfoCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  InputNumber,
  Row,
  Select,
  Tooltip,
  message,
} from "antd";
import { type Dayjs } from "dayjs";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";

import { DATE_FORMAT_API } from "@shared/constants/app";

import { getHotels } from "../../hotels/services/hotelService";
import { getRoomTypes } from "../../room-type/services/roomTypeService";

import type { Hotel } from "../../hotels/types/hotels";
import type { RoomType } from "../../room-type/types/roomType";

const CHILD_AGE_OPTIONS = [
  { value: 0.5, label: "Below 1 year" },
  ...Array.from({ length: 18 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i + 1 === 1 ? "year" : "years"}`,
  })),
];

interface BookingDetailsFormValues {
  hotelId: number | null;
  roomTypeId: number | null;
  numAdults: number;
  numChildren: number;
  childrenAges: { age: number | undefined }[];
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
  isLoading?: boolean;
}

const BookingDetailsForm: React.FC<BookingDetailsFormProps> = ({
  onFinish,
  initialValues,
  mode = "create",
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    getValues,
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
    clearErrors(["numAdults", "numRooms"]);
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

  // Sync childrenAges array length with numChildren count.
  // Use getValues (reads from internal store, not reactive state) to avoid stale closure
  // when this effect fires after a form reset() call.
  useEffect(() => {
    const count = numChildren ?? 0;
    const currentAges = getValues("childrenAges");
    replaceChildrenAges(
      Array.from({ length: count }, (_, i) => ({
        age: currentAges[i]?.age,
      })),
    );
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
        // Children strictly over 10 count as adults for occupancy (age 10 and under are free)
        const childrenOver10 = (values.childrenAges ?? []).filter(
          (c) => (c.age ?? 0) > 10,
        ).length;
        const effectiveAdults = values.numAdults + childrenOver10;

        const maxOccupancy = selectedRoomType.maxOccupancy;
        // Each room allows maxOccupancy + 1 adults (1 extra with charge)
        const minRoomsNeeded =
          maxOccupancy > 0
            ? Math.ceil(effectiveAdults / (maxOccupancy + 1))
            : values.numRooms;

        if (values.numRooms < minRoomsNeeded) {
          setError("numRooms", {
            type: "manual",
            message: ` ${effectiveAdults} adult${effectiveAdults !== 1 ? "s" : ""} needs at least ${minRoomsNeeded} room${minRoomsNeeded !== 1 ? "s" : ""}.`,
          });
          return;
        }

        const maxAllowed = maxOccupancy * values.numRooms;
        const extraAdults = Math.max(0, effectiveAdults - maxAllowed);
        if (extraAdults > 0) {
          const totalExtraCharge =
            extraAdults * selectedRoomType.extraAdultChargeCents;
          void message.info(
            `${extraAdults} extra adult${extraAdults > 1 ? "s" : ""} detected. An additional charge of ₹${(totalExtraCharge / 100).toLocaleString("en-IN")} + 5% tax will be applied at checkout.`,
            6,
          );
        }
      }
    }

    onFinish(values);
  };

  return (
    <Form
      onFinish={handleSubmit(handleSubmitWithOccupancyCheck)}
      layout="vertical"
    >
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
                <Tooltip title="Enter count of guests aged 10 and under. They are free and do not count toward room capacity. Guests aged 11+ must be counted as adults.">
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
                  rules={{ required: "Age is required" }}
                  render={({ field: ageField }) => (
                    <Select
                      {...ageField}
                      placeholder="Select age"
                      options={CHILD_AGE_OPTIONS}
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
        <Button type="primary" htmlType="submit" loading={isLoading}>
          {mode === "create" ? "Check Availability" : "Next"}
        </Button>
      </div>
    </Form>
  );
};

export default BookingDetailsForm;
