import { type HotelListResponse } from "@shared/models";

import { fetcher } from "../../../utils/swrFetcher";

const HOTELS_API_ENDPOINT = "/hotels";

export const getHotels = (queryString = "") => {
  const url = queryString
    ? `${HOTELS_API_ENDPOINT}?${queryString}`
    : HOTELS_API_ENDPOINT;
  return fetcher<HotelListResponse>(url);
};
