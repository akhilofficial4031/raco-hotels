import { PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  message,
  Popover,
  Select,
  Space,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import useSWR, { mutate } from "swr";
import { z } from "zod";

import { getHotels } from "../features/hotels/services/hotel.service";
import RoomForm from "../features/rooms/RoomForm";
import { updateRoom, getRooms } from "../features/rooms/services/room.service";
import { useQueryParams } from "../shared/hooks";
import { type Hotel } from "../shared/models/hotels";
import { type IRoom, RoomStatus } from "../shared/models/rooms";

const { Title } = Typography;

const editRoomSchema = z.object({
  hotelId: z.number({ message: "Hotel is required" }),
  roomTypeId: z.number({ message: "Room type is required" }),
  roomNumber: z
    .string()
    .min(1, { message: "Room number is required" })
    .optional(),
  floor: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(RoomStatus).optional(),
});

function Rooms() {
  const navigate = useNavigate();
  const { queryParams, setQueryParams } = useQueryParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRoom, setEditingRoom] = useState<IRoom | null>(null);
  const [selectedHotelId, setSelectedHotelId] = useState<number | undefined>(
    queryParams.get("hotelId") ? Number(queryParams.get("hotelId")) : undefined,
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(editRoomSchema),
  });

  useEffect(() => {
    if (editingRoom) {
      reset({
        ...editingRoom,
      });
    }
  }, [editingRoom, reset]);

  // Fetch hotels for the selector
  const { data: hotelsData } = useSWR("/hotels", () => getHotels("limit=-1"));

  // Fetch rooms for the selected hotel
  const { data: roomsData, isLoading } = useSWR(
    selectedHotelId ? `/rooms?hotelId=${selectedHotelId}` : null,
    () => getRooms(`hotelId=${selectedHotelId}`),
  );

  const groupedRooms = useMemo(() => {
    if (!roomsData?.data.rooms) return {};

    const sortedRooms = [...roomsData.data.rooms].sort((a, b) => {
      return a.roomNumber.localeCompare(b.roomNumber, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    return sortedRooms.reduce((acc: { [key: string]: IRoom[] }, room) => {
      const roomTypeName = room.roomType?.name || "Uncategorized";
      if (!acc[roomTypeName]) {
        acc[roomTypeName] = [];
      }
      acc[roomTypeName].push(room);
      return acc;
    }, {});
  }, [roomsData]);

  const handleHotelChange = (hotelId: number) => {
    setSelectedHotelId(hotelId);
    setQueryParams({ hotelId: String(hotelId) });
  };

  const handleEdit = (room: IRoom) => {
    setEditingRoom(room);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setEditingRoom(null);
    setIsDrawerOpen(false);
    reset({});
  };

  const handleSave = async (data: IRoom) => {
    if (!editingRoom) return;
    try {
      setIsSaving(true);
      await updateRoom(editingRoom.id, data);
      mutate(`/rooms?hotelId=${selectedHotelId}`);
      message.success("Room updated successfully");
      handleDrawerClose();
    } catch (error: any) {
      message.error(error.info?.message || "Failed to update room");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center bg-white p-4 rounded-lg mb-2 border border-gray-200">
        <Select
          placeholder="Select a hotel to view rooms"
          style={{ width: 300 }}
          onChange={handleHotelChange}
          value={selectedHotelId}
          options={hotelsData?.data.hotels.map((hotel: Hotel) => ({
            value: hotel.id,
            label: hotel.name,
          }))}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/rooms/add")}
        >
          Add Rooms
        </Button>
      </div>

      {isLoading && <p>Loading rooms...</p>}
      {!isLoading && !Object.keys(groupedRooms).length && (
        <div className="bg-white p-4 rounded-lg mb-2 border border-gray-200 flex justify-center items-center h-full">
          <Empty description="No rooms found" />
        </div>
      )}

      {!isLoading &&
        selectedHotelId &&
        Object.keys(groupedRooms).map((roomTypeName) => (
          <Card
            key={roomTypeName}
            title={
              <Title level={4} className="!m-0">
                {roomTypeName}
              </Title>
            }
            className="shadow-sm border-gray-200 !mb-2"
          >
            <div className="flex flex-wrap gap-2">
              {groupedRooms[roomTypeName].map((room) => (
                <Popover
                  key={room.id}
                  content={`Status: ${room.status}`}
                  title="Room Details"
                >
                  <div
                    className={`h-16 w-16 flex flex-col items-center justify-center rounded-md cursor-pointer text-gray-500 ${
                      room.status === RoomStatus.Available
                        ? "border border-green-500"
                        : "border border-gray-300 bg-gray-300"
                    }`}
                    onClick={() => handleEdit(room)}
                  >
                    <span>{room.roomNumber}</span>
                  </div>
                </Popover>
              ))}
            </div>
          </Card>
        ))}

      <Drawer
        title={editingRoom ? "Edit Room" : "Add Room"}
        width={500}
        onClose={handleDrawerClose}
        open={isDrawerOpen}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        footer={
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleDrawerClose}>Cancel</Button>
            <Button
              onClick={handleSubmit(handleSave)}
              type="primary"
              loading={isSaving}
            >
              Save
            </Button>
          </Space>
        }
      >
        {editingRoom && (
          <Form layout="vertical" onFinish={handleSubmit(handleSave)}>
            <RoomForm
              control={control}
              errors={errors}
              isEditMode={!!editingRoom}
            />
          </Form>
        )}
      </Drawer>
    </div>
  );
}

export default Rooms;
