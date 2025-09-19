/* eslint-disable no-unused-vars */
import { Button, Form, Input, Select } from "antd";
import { Controller } from "react-hook-form";
import useSWR from "swr";

import { IRoom, RoomStatus } from "../../shared/models/rooms";
import { getHotels } from "../hotels/services/hotelService";
import { getRoomTypesByHotel } from "../room-type/services/room-type.service";

const { TextArea } = Input;

interface RoomFormProps {
  control: any;
  errors: any;
  isEditMode: boolean;
  selectedHotelId?: number;
  onGenerateClick?: () => void;
}

const RoomForm: React.FC<RoomFormProps> = ({
  control,
  errors,
  isEditMode,
  selectedHotelId,
  onGenerateClick,
}) => {
  const { data: hotelsData } = useSWR("/hotels", getHotels);

  const { data: roomTypesData } = useSWR(
    selectedHotelId ? `/room-types/hotel/${selectedHotelId}` : null,
    () =>
      selectedHotelId
        ? getRoomTypesByHotel(selectedHotelId)
        : Promise.resolve(undefined),
  );

  return (
    <>
      <Form.Item
        label="Hotel"
        required
        validateStatus={errors.hotelId ? "error" : ""}
        help={errors.hotelId?.message as string}
      >
        <Controller
          name="hotelId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Select hotel"
              options={hotelsData?.data.hotels.map((hotel) => ({
                value: hotel.id,
                label: hotel.name,
              }))}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Room Type"
        required
        validateStatus={errors.roomTypeId ? "error" : ""}
        help={errors.roomTypeId?.message as string}
      >
        <Controller
          name="roomTypeId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Select room type"
              disabled={!selectedHotelId}
              options={roomTypesData?.data.roomTypes.map((rt) => ({
                value: rt.id,
                label: rt.name,
              }))}
            />
          )}
        />
      </Form.Item>

      {isEditMode ? (
        <Form.Item
          label="Room Number"
          required
          validateStatus={errors.roomNumber ? "error" : ""}
          help={errors.roomNumber?.message as string}
        >
          <Controller
            name="roomNumber"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="roomNumbers"
              className="ant-form-item-required"
              style={{ lineHeight: "32px" }}
            >
              Room Numbers (one per line)
            </label>
            <Button onClick={onGenerateClick}>Generate Room Numbers</Button>
          </div>
          <Form.Item
            validateStatus={errors.roomNumbers ? "error" : ""}
            help={errors.roomNumbers?.message as string}
          >
            <Controller
              name="roomNumbers"
              control={control}
              render={({ field }) => (
                <TextArea {...field} placeholder={"101\n102A\n103"} rows={4} />
              )}
            />
          </Form.Item>
        </>
      )}

      <Form.Item
        label="Floor"
        validateStatus={errors.floor ? "error" : ""}
        help={errors.floor?.message as string}
      >
        <Controller
          name="floor"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Enter floor" />}
        />
      </Form.Item>

      <Form.Item
        label="Description"
        validateStatus={errors.description ? "error" : ""}
        help={errors.description?.message as string}
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              placeholder="Enter description (optional)"
              rows={4}
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Status"
        validateStatus={errors.status ? "error" : ""}
        help={errors.status?.message as string}
      >
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Select status"
              options={Object.values(RoomStatus).map((status) => ({
                value: status,
                label: status,
              }))}
            />
          )}
        />
      </Form.Item>
    </>
  );
};

export default RoomForm;
