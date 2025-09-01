import { fetcher } from "../../utils/swrFetcher";
import { type Customer } from "../models/customer";

export interface FindCustomerByPhoneResponse {
  success: boolean;
  message: string;
  data: {
    customer: Customer | null;
    found: boolean;
    message: string;
  };
}

/**
 * Search for a customer by phone number
 * @param phone - The phone number to search for
 * @returns Promise containing customer data if found
 */
export const findCustomerByPhone = async (
  phone: string,
): Promise<FindCustomerByPhoneResponse> => {
  return fetcher(`/customers/find-by-phone?phone=${encodeURIComponent(phone)}`);
};
