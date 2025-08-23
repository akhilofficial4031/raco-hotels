import { fetcher } from "../../../utils/swrFetcher";
import { HotelListResponse } from "../../shared/models/hotels";

const HOTELS_API_ENDPOINT = "/hotels";

export const getHotels = (queryString = "") => {
  const url = queryString
    ? `${HOTELS_API_ENDPOINT}?${queryString}`
    : HOTELS_API_ENDPOINT;
  return fetcher<HotelListResponse>(url);
};
