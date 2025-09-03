import { type RoomTypeListResponse } from "../../../shared/models";
import { fetcher } from "../../../utils/swrFetcher";

const ROOM_TYPES_API_ENDPOINT = "/room-types";

export const getRoomTypes = (queryString = "") => {
  const url = queryString
    ? `${ROOM_TYPES_API_ENDPOINT}?${queryString}`
    : ROOM_TYPES_API_ENDPOINT;
  return fetcher<RoomTypeListResponse>(url);
};

export const getRoomTypesByHotel = (hotelId: number) => {
  const url = `${ROOM_TYPES_API_ENDPOINT}?hotelId=${hotelId}&limit=-1`;
  return fetcher<RoomTypeListResponse>(url);
};
