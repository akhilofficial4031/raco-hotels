import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Form, message } from "antd";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

import { useQueryParams } from "@shared/hooks";

import GenerateRoomsModal from "../components/GenerateRoomsModal";
import RoomForm from "../components/RoomForm";
import { createRooms } from "../services/roomService";
import { type ICreateRoom, RoomStatus } from "../types/rooms";

const addRoomSchema = z.object({
  hotelId: z.number({ message: "Hotel is required" }),
  roomTypeId: z.number({ message: "Room type is required" }),
  roomNumbers: z
    .string()
    .min(1, { message: "At least one room number is required" })
    .refine(
      (value) => {
        const roomCount = value.split("\n").filter(Boolean).length;
        return roomCount <= 20;
      },
      { message: "You can add a maximum of 20 rooms at a time" },
    ),
  floor: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(RoomStatus).optional(),
});

function AddRoomPage() {
  const navigate = useNavigate();
  const { queryParams } = useQueryParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    resetField,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(addRoomSchema),
    defaultValues: {
      hotelId: queryParams.get("hotelId")
        ? Number(queryParams.get("hotelId"))
        : undefined,
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
      navigate(`/rooms?hotelId=${data.hotelId}`);
    } catch (error: any) {
      message.error(error.info?.message || "Failed to add rooms");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateRooms = (roomNumbers: string[]) => {
    setValue("roomNumbers", roomNumbers.join("\n"));
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
            onGenerateClick={() => setIsGenerateModalOpen(true)}
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
      <GenerateRoomsModal
        open={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateRooms}
      />
    </div>
  );
}

export default AddRoomPage;
