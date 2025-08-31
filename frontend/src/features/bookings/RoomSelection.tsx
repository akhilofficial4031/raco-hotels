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

import { type Addon } from "../../shared/models/addon";
import { type RoomTypeWithRelations } from "../../shared/models/room-type";
import { RoomStatus, type IRoom } from "../../shared/models/rooms";
import { fetcher } from "../../utils/swrFetcher";
import { getRoomTypesByHotel } from "../room-type/services/room-type.service";

const { Title, Text } = Typography;

interface RoomSelectionProps {
  hotelId: number;
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
  numRooms: number;
  onNext: (_values: {
    selectedRooms: IRoom[];
    selectedAddons: Addon[];
    roomTypeDetails?: RoomTypeWithRelations;
  }) => void;
  onBack: () => void;
  initialSelectedRooms?: IRoom[];
  initialSelectedAddons?: Addon[];
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
}) => {
  const [selectedRooms, setSelectedRooms] =
    useState<IRoom[]>(initialSelectedRooms);
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

  const { data: availabilityData, isLoading: isLoadingAvailability } = useSWR<{
    data: { results: IRoom[] };
  }>(
    `/availability?hotelId=${hotelId}&roomTypeId=${roomTypeId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const { data: addonsData, isLoading: isLoadingAddons } = useSWR<{
    data: { addons: Addon[] };
  }>(`/addons?roomTypeId=${roomTypeId}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const availableRooms = availabilityData?.data?.results || [];
  const allAddons = addonsData?.data?.addons || [];

  const roomTypeDetails = useMemo(() => {
    return roomTypesData?.data.roomTypes.find(
      (rt: RoomTypeWithRelations) => rt.id === roomTypeId,
    );
  }, [roomTypesData, roomTypeId]);

  const addons = useMemo(() => {
    if (!roomTypeDetails?.addons) return [];
    const pricedAddonIds = new Set(
      roomTypeDetails.addons.map((a: any) => a.addonId),
    );
    return allAddons.filter((addon) => pricedAddonIds.has(addon.id));
  }, [allAddons, roomTypeDetails]);

  const groupedRooms = useMemo(() => {
    if (!availableRooms) return {};

    const sortedRooms = [...availableRooms].sort((a, b) => {
      return a.roomNumber.localeCompare(b.roomNumber, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    return sortedRooms.reduce((acc: { [key: string]: IRoom[] }, room) => {
      const floor = room.floor || "Uncategorized";
      if (!acc[floor]) {
        acc[floor] = [];
      }
      acc[floor].push(room);
      return acc;
    }, {});
  }, [availableRooms]);

  if (isLoadingAvailability || isLoadingAddons) {
    return <Spin />;
  }

  const handleRoomSelect = (room: IRoom) => {
    setSelectedRooms((prev) => {
      const isSelected = prev.some((r) => r.id === room.id);
      if (isSelected) {
        return prev.filter((r) => r.id !== room.id);
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
    const fullSelectedAddons = allAddons.filter((addon) =>
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
              {groupedRooms[floor].map((room: IRoom) => (
                <Popover
                  key={room.id}
                  content={`Status: ${room.status}`}
                  title="Room Details"
                >
                  <div
                    className={`h-16 w-16 flex flex-col items-center justify-center rounded-md cursor-pointer text-gray-500 ${
                      selectedRooms.some((r) => r.id === room.id)
                        ? "border-2 border-blue-500"
                        : room.status === RoomStatus.Available
                          ? "border border-green-500"
                          : "border border-gray-300 bg-gray-300"
                    }`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <span>{room.roomNumber}</span>
                  </div>
                </Popover>
              ))}
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
        renderItem={(addon: Addon) => (
          <List.Item
            onClick={() => handleAddonToggle(addon.id)}
            className="cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center w-full">
              <Checkbox checked={selectedAddons.has(addon.id)} />
              <div className="ml-4">
                <Text strong>{addon.name}</Text>
                <br />
                <Text type="secondary">{addon.description}</Text>
              </div>
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
