import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Form, message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

import RoomForm from "../../features/rooms/RoomForm";
import { createRooms } from "../../features/rooms/services/room.service";
import { type ICreateRoom, RoomStatus } from "../../shared/models/rooms";

const addRoomSchema = z.object({
  hotelId: z.number({ message: "Hotel is required" }),
  roomTypeId: z.number({ message: "Room type is required" }),
  roomNumbers: z
    .string()
    .min(1, { message: "At least one room number is required" }),
  floor: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(RoomStatus).optional(),
});

function AddRoomPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    resetField,
  } = useForm<any>({
    resolver: zodResolver(addRoomSchema),
    defaultValues: {
      hotelId: undefined,
      roomTypeId: undefined,
      roomNumbers: "",
      floor: "",
      description: "",
      status: RoomStatus.Available,
    },
  });

  const selectedHotelId = watch("hotelId");

  useEffect(() => {
    if (selectedHotelId) {
      resetField("roomTypeId");
    }
  }, [selectedHotelId, resetField]);

  const handleAddRoom = async (data: ICreateRoom) => {
    try {
      setIsSaving(true);
      const roomNumbers = (data.roomNumbers as any)
        .split("\n")
        .map((s: string) => s.trim())
        .filter(Boolean);
      await createRooms({ ...data, roomNumbers });
      message.success("Rooms added successfully");
      navigate("/rooms");
    } catch (error: any) {
      message.error(error.info?.message || "Failed to add rooms");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Form layout="vertical" onFinish={handleSubmit(handleAddRoom)}>
        <Card
          title={<span className="text-lg font-semibold">Room Details</span>}
          className="shadow-sm border-gray-200"
        >
          <RoomForm
            control={control}
            errors={errors}
            isEditMode={false}
            selectedHotelId={selectedHotelId}
          />
        </Card>
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            onClick={() => navigate("/rooms")}
            size="large"
            className="px-8"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isSaving}
            className="px-8"
          >
            Create Rooms
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default AddRoomPage;
