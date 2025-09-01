import { type ApiResponse } from "../../../shared/models";
import { type Booking } from "../../../shared/models/bookings";
import { fetcher, mutationFetcher } from "../../../utils/swrFetcher";

export const getBookingById = async (
  id: string,
): Promise<ApiResponse<{ booking: Booking }>> => {
  return fetcher(`/bookings/${id}`);
};

export const updateBooking = async (
  id: string,
  data: any,
): Promise<ApiResponse<{ booking: Booking }>> => {
  return mutationFetcher(`/bookings/${id}`, {
    arg: {
      method: "PUT",
      body: data,
    },
  });
};
