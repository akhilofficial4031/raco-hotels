import { fetcher, mutationFetcher } from "../../../utils/swrFetcher";
import { ICreateRoom, IRoom } from "../../shared/models/rooms";
import { buildUrlWithParams } from "../../shared/utils/queryParams";

const ROOMS_API_ENDPOINT = "/rooms";

export const getRooms = (queryString = "") => {
  const url = queryString
    ? `${ROOMS_API_ENDPOINT}?${queryString}`
    : ROOMS_API_ENDPOINT;
  return fetcher<{
    data: { rooms: IRoom[]; pagination?: any };
  }>(url);
};

export const updateRoom = (id: number, data: any) => {
  return mutationFetcher(`${ROOMS_API_ENDPOINT}/${id}`, {
    arg: {
      method: "PUT",
      body: data,
    },
  });
};

export const createRooms = (data: ICreateRoom) => {
  return mutationFetcher(ROOMS_API_ENDPOINT, {
    arg: {
      method: "POST",
      body: data,
    },
  });
};
