import useSWR from "swr";

import { fetcher } from "../../../utils/swrFetcher";

import type { CustomerDetailsResponseData } from "../../../shared/services/customer.service";

export const useCustomerDetails = (customerId: string | undefined) => {
  const { data, error, isLoading, mutate } =
    useSWR<CustomerDetailsResponseData>(
      customerId ? `/customers/${customerId}/details` : null,
      fetcher,
      {
        revalidateOnFocus: false, // Prevent refetch on window focus
        revalidateOnReconnect: false, // Prevent refetch on reconnect
        dedupingInterval: 60000, // Cache for 1 minute to prevent duplicate requests
      },
    );

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate,
  };
};
