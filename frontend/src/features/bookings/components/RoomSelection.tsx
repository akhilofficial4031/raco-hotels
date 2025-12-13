/* eslint-disable no-unused-vars */
import {
  Button,
  Card,
  Checkbox,
  Empty,
  List,
  message,
  Popover,
  Spin,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import useSWR from "swr";

import { type ApiResponse } from "@shared/types/api";
import { fetcher } from "@utils/swrFetcher";

import { type AddonInBooking } from "../../addon/types/addon";
import { getRoomTypesByHotel } from "../../room-type/services/roomTypeService";
import { type RoomTypeWithRelations } from "../../room-type/types/roomType";
import {
  type IRoomAvailability,
  type BookingRoomTypeRooms,
  RoomStatus,
} from "../../rooms/types/rooms";

const { Title, Text } = Typography;

interface RoomSelectionProps {
  hotelId: number;
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
  numRooms: number;
  onNext: (_values: {
    selectedRooms: BookingRoomTypeRooms[];
    selectedAddons: AddonInBooking[];
    roomTypeDetails?: RoomTypeWithRelations;
  }) => void;
  onBack: () => void;
  initialSelectedRooms?: BookingRoomTypeRooms[];
  initialSelectedAddons?: AddonInBooking[];
  mode?: "create" | "edit" | "checkin";
}

const RoomSelection: React.FC<RoomSelectionProps> = ({
  hotelId,
  roomTypeId,
  checkInDate,
  checkOutDate,
  numRooms,
  onNext,
  onBack,
  initialSelectedRooms = [],
  initialSelectedAddons = [],
  mode = "create",
}) => {
  const [selectedRooms, setSelectedRooms] =
    useState<BookingRoomTypeRooms[]>(initialSelectedRooms);
  const [selectedAddons, setSelectedAddons] = useState<Set<number>>(
    new Set(initialSelectedAddons.map((a) => a.id)),
  );

  const { data: roomTypesData } = useSWR(
    `/room-types?hotelId=${hotelId}`,
    () => getRoomTypesByHotel(hotelId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const availabilityQuery = `/rooms/availability?hotelId=${hotelId}&roomTypeId=${roomTypeId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;

  const { data: availabilityData, isLoading: isLoadingAvailability } = useSWR<
    ApiResponse<IRoomAvailability>
  >(availabilityQuery, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Remove separate addon API call since addons are included in room type data

  const availableRooms = availabilityData?.data?.roomTypes?.[0]?.rooms || [];

  const allRoomsToDisplay = useMemo(() => {
    const roomMap = new Map<number, BookingRoomTypeRooms>();

    // Add available rooms
    availableRooms.forEach((room) => roomMap.set(room.roomId, room));

    // Add/overwrite with initial selected rooms to ensure they are present
    // For edit mode, these rooms should be available even if the API says they're booked
    initialSelectedRooms.forEach((room) => {
      roomMap.set(room.roomId, {
        ...room,
        status: mode === "edit" ? RoomStatus.Available : room.status,
      });
    });

    const finalRooms = Array.from(roomMap.values());
    return finalRooms;
  }, [availableRooms, initialSelectedRooms, mode]);

  const roomTypeDetails = useMemo(() => {
    return roomTypesData?.data.roomTypes.find(
      (rt: RoomTypeWithRelations) => rt.id === roomTypeId,
    );
  }, [roomTypesData, roomTypeId]);

  const addons = useMemo(() => {
    if (!roomTypeDetails?.addons) return [];
    // Transform room type addons to include pricing information
    return roomTypeDetails.addons.map((roomTypeAddon: any) => ({
      id: roomTypeAddon.addonId,
      name: roomTypeAddon.name,
      description: roomTypeAddon.description,
      category: roomTypeAddon.category,
      unitType: roomTypeAddon.unitType,
      isActive: 1, // Assume active if included in room type
      priceCents: roomTypeAddon.priceCents,
    }));
  }, [roomTypeDetails]);

  const groupedRooms = useMemo(() => {
    if (!allRoomsToDisplay) return {};

    const sortedRooms = [...allRoomsToDisplay].sort((a, b) => {
      return a.roomNumber.localeCompare(b.roomNumber, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    return sortedRooms.reduce(
      (acc: { [key: string]: BookingRoomTypeRooms[] }, room) => {
        const floor = room.floor || "Uncategorized";
        if (!acc[floor]) {
          acc[floor] = [];
        }
        acc[floor].push(room);
        return acc;
      },
      {},
    );
  }, [allRoomsToDisplay]);

  if (isLoadingAvailability) {
    return <Spin />;
  }

  const handleRoomSelect = (room: BookingRoomTypeRooms) => {
    setSelectedRooms((prev) => {
      const isSelected = prev.some((r) => r.roomId === room.roomId);
      if (isSelected) {
        return prev.filter((r) => r.roomId !== room.roomId);
      }
      if (prev.length < numRooms) {
        return [...prev, room];
      }
      message.warning(`You can only select up to ${numRooms} rooms.`);
      return prev;
    });
  };

  const handleAddonToggle = (addonId: number) => {
    setSelectedAddons((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(addonId)) {
        newSelected.delete(addonId);
      } else {
        newSelected.add(addonId);
      }
      return newSelected;
    });
  };

  const handleNext = () => {
    const fullSelectedAddons = addons.filter((addon) =>
      selectedAddons.has(addon.id),
    );
    onNext({
      selectedRooms,
      selectedAddons: fullSelectedAddons,
      roomTypeDetails,
    });
  };

  return (
    <div>
      {Object.keys(groupedRooms).length > 0 ? (
        Object.keys(groupedRooms).map((floor) => (
          <Card
            key={floor}
            title={
              <Title level={5} className="!m-0">
                Floor {floor}
              </Title>
            }
            className="shadow-sm border-gray-200 !mb-2"
          >
            <div className="flex flex-wrap gap-2">
              {groupedRooms[floor].map((room: BookingRoomTypeRooms) => {
                const isSelected = selectedRooms.some(
                  (r) => r.roomId === room.roomId,
                );
                const isAvailable = room.status === RoomStatus.Available;
                const isInitiallySelected =
                  mode === "edit" &&
                  initialSelectedRooms.some((r) => r.roomId === room.roomId);
                const isSelectable =
                  isAvailable || isSelected || isInitiallySelected;
                return (
                  <Popover
                    key={room.roomId}
                    content={
                      isInitiallySelected
                        ? `Currently booked in this booking (${room.status})`
                        : `Status: ${room.status}`
                    }
                    title="Room Details"
                  >
                    <div
                      className={`h-16 w-16 flex flex-col items-center justify-center rounded-md text-gray-500 ${
                        isSelectable ? "cursor-pointer" : "cursor-not-allowed"
                      } ${
                        isSelected
                          ? "border-2 border-green-800 text-green-800 bg-green-100"
                          : isInitiallySelected
                            ? "border-2 border-yellow-500 bg-yellow-50" // Show initially selected rooms
                            : isAvailable
                              ? "border border-green-500"
                              : "border border-gray-300 bg-gray-300"
                      }`}
                      onClick={() => {
                        if (isSelectable) {
                          handleRoomSelect(room);
                        }
                      }}
                    >
                      <span>{room.roomNumber}</span>
                    </div>
                  </Popover>
                );
              })}
            </div>
          </Card>
        ))
      ) : (
        <Empty description="No available rooms for the selected criteria." />
      )}

      <Title level={5} className="mt-8">
        Add-ons
      </Title>
      <List
        itemLayout="horizontal"
        dataSource={addons}
        renderItem={(addon: AddonInBooking) => (
          <List.Item
            onClick={() => handleAddonToggle(addon.id)}
            className="cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Checkbox
                  checked={selectedAddons.has(addon.id)}
                  onChange={() => handleAddonToggle(addon.id)}
                />
                <div className="ml-4">
                  <Text>
                    {addon.name} - ₹{(addon.priceCents / 100).toFixed(2)}
                  </Text>
                  <br />
                  <Text type="secondary">{addon.description}</Text>
                </div>
              </div>
              {/* <div className="text-right">
                <Text strong className="text-lg">
                  ₹{(addon.priceCents / 100).toFixed(2)}
                </Text>
                <br />
                <Text type="secondary" className="text-sm">
                  per {addon.unitType}
                </Text>
              </div> */}
            </div>
          </List.Item>
        )}
      />
      <div className="flex justify-end mt-8 space-x-4">
        <Button onClick={onBack}>Back</Button>
        <Button
          type="primary"
          onClick={handleNext}
          disabled={selectedRooms.length !== numRooms}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default RoomSelection;
