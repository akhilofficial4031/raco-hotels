/* eslint-disable no-unused-vars */
import {
  Alert,
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
import { useEffect, useMemo, useState } from "react";
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

// Children aged 10+ are counted as adults for occupancy purposes
const CHILD_ADULT_AGE_THRESHOLD = 10;

interface RoomSelectionProps {
  hotelId: number;
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
  numRooms: number;
  numAdults: number;
  numChildren: number;
  childrenAges?: { age: number | undefined }[];
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
  numAdults,
  numChildren,
  childrenAges = [],
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
  const [emptyToastShown, setEmptyToastShown] = useState(false);

  // Children aged 10+ count toward occupancy as adults
  const childrenOver10Count = useMemo(
    () => childrenAges.filter((c) => (c.age ?? 0) >= CHILD_ADULT_AGE_THRESHOLD).length,
    [childrenAges],
  );
  const effectiveAdults = numAdults + childrenOver10Count;

  const { data: roomTypesData } = useSWR(
    `/room-types?hotelId=${hotelId}`,
    () => getRoomTypesByHotel(hotelId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const availabilityQuery = `/rooms/availability?hotelId=${hotelId}&roomTypeId=${roomTypeId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&guestCount=${effectiveAdults}&numberOfRooms=${numRooms}`;

  const { data: availabilityData, isLoading: isLoadingAvailability } = useSWR<
    ApiResponse<IRoomAvailability>
  >(availabilityQuery, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const availableRooms = availabilityData?.data?.roomTypes?.[0]?.rooms || [];

  const allRoomsToDisplay = useMemo(() => {
    const roomMap = new Map<number, BookingRoomTypeRooms>();

    availableRooms.forEach((room) => roomMap.set(room.roomId, room));

    // Ensure initially selected rooms are present (edit mode — may be booked)
    initialSelectedRooms.forEach((room) => {
      roomMap.set(room.roomId, {
        ...room,
        status: mode === "edit" ? RoomStatus.Available : room.status,
      });
    });

    return Array.from(roomMap.values());
  }, [availableRooms, initialSelectedRooms, mode]);

  // Show toast once when rooms come back empty (on create mode)
  useEffect(() => {
    if (
      !isLoadingAvailability &&
      !emptyToastShown &&
      availableRooms.length === 0 &&
      initialSelectedRooms.length === 0
    ) {
      void message.warning(
        "No rooms are available for the selected criteria. Please adjust your dates or room type.",
        5,
      );
      setEmptyToastShown(true);
    }
  }, [isLoadingAvailability, availableRooms.length, initialSelectedRooms.length, emptyToastShown]);

  const roomTypeDetails = useMemo(() => {
    return roomTypesData?.data.roomTypes.find(
      (rt: RoomTypeWithRelations) => rt.id === roomTypeId,
    );
  }, [roomTypesData, roomTypeId]);

  const addons = useMemo(() => {
    if (!roomTypeDetails?.addons) return [];
    return roomTypeDetails.addons.map((roomTypeAddon: any) => ({
      id: roomTypeAddon.addonId,
      name: roomTypeAddon.name,
      description: roomTypeAddon.description,
      category: roomTypeAddon.category,
      unitType: roomTypeAddon.unitType,
      isActive: 1,
      priceCents: roomTypeAddon.priceCents,
    }));
  }, [roomTypeDetails]);

  const groupedRooms = useMemo(() => {
    if (!allRoomsToDisplay) return {};

    const sortedRooms = [...allRoomsToDisplay].sort((a, b) =>
      a.roomNumber.localeCompare(b.roomNumber, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

    return sortedRooms.reduce(
      (acc: { [key: string]: BookingRoomTypeRooms[] }, room) => {
        const floor = room.floor || "Uncategorized";
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(room);
        return acc;
      },
      {},
    );
  }, [allRoomsToDisplay]);

  // Occupancy calculations — each room allows maxOccupancy + 1 adults (1 extra per room with charge)
  const maxOccupancy = availabilityData?.data?.roomTypes?.[0]?.maxOccupancy ?? 0;
  const extraAdultChargeCents =
    availabilityData?.data?.roomTypes?.[0]?.extraAdultChargeCents ?? 100000;
  const maxAllowed = maxOccupancy * numRooms;
  const maxAllowedWithExtra = maxAllowed + numRooms;
  // Minimum rooms needed accounting for 1 extra adult allowance per room
  const minRoomsNeeded =
    maxOccupancy > 0
      ? Math.ceil(effectiveAdults / (maxOccupancy + 1))
      : numRooms;
  const extraAdults =
    maxOccupancy > 0 ? Math.max(0, effectiveAdults - maxAllowed) : 0;
  const hasExtraAdult = extraAdults > 0 && effectiveAdults <= maxAllowedWithExtra;
  const isOverCapacity =
    maxOccupancy > 0 && effectiveAdults > maxAllowedWithExtra;

  if (isLoadingAvailability) {
    return <Spin />;
  }

  const handleRoomSelect = (room: BookingRoomTypeRooms) => {
    setSelectedRooms((prev) => {
      const isSelected = prev.some((r) => r.roomId === room.roomId);
      if (isSelected) return prev.filter((r) => r.roomId !== room.roomId);
      if (prev.length < numRooms) return [...prev, room];
      void message.warning(`You can only select up to ${numRooms} rooms.`);
      return prev;
    });
  };

  const handleAddonToggle = (addonId: number) => {
    setSelectedAddons((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(addonId)) newSelected.delete(addonId);
      else newSelected.add(addonId);
      return newSelected;
    });
  };

  const handleNext = () => {
    const fullSelectedAddons = addons.filter((addon) =>
      selectedAddons.has(addon.id),
    );
    onNext({ selectedRooms, selectedAddons: fullSelectedAddons, roomTypeDetails });
  };

  return (
    <div>
      {/* Occupancy info banners */}
      {maxOccupancy > 0 && (
        <div className="mb-4 space-y-2">
          {childrenOver10Count > 0 && (
            <Alert
              type="info"
              showIcon
              message={`${childrenOver10Count} child${childrenOver10Count > 1 ? "ren" : ""} aged 10+ ${childrenOver10Count > 1 ? "are" : "is"} counted as adult${childrenOver10Count > 1 ? "s" : ""}. Effective adult count: ${effectiveAdults}.`}
            />
          )}

          <Alert
            type="info"
            showIcon
            message={`Each room accommodates up to ${maxOccupancy} adults (or ${maxOccupancy + 1} with an extra adult charge of ₹${(extraAdultChargeCents / 100).toLocaleString("en-IN")}). Your group of ${effectiveAdults} adult${effectiveAdults !== 1 ? "s" : ""} needs at least ${minRoomsNeeded} room${minRoomsNeeded !== 1 ? "s" : ""}.`}
          />

          {hasExtraAdult && (
            <Alert
              type="warning"
              showIcon
              message={`${extraAdults} extra adult${extraAdults > 1 ? "s" : ""} identified across ${numRooms} room${numRooms !== 1 ? "s" : ""}. Additional charge: ₹${((extraAdults * extraAdultChargeCents) / 100).toLocaleString("en-IN")} + 5% tax.`}
            />
          )}

          {isOverCapacity && (
            <Alert
              type="error"
              showIcon
              message={`Your group of ${effectiveAdults} adults cannot be accommodated in ${numRooms} room${numRooms !== 1 ? "s" : ""} (max ${maxOccupancy + 1} per room). Please go back and select at least ${minRoomsNeeded} room${minRoomsNeeded !== 1 ? "s" : ""}.`}
            />
          )}
        </div>
      )}

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
                            ? "border-2 border-yellow-500 bg-yellow-50"
                            : isAvailable
                              ? "border border-green-500"
                              : "border border-gray-300 bg-gray-300"
                      }`}
                      onClick={() => {
                        if (isSelectable) handleRoomSelect(room);
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
