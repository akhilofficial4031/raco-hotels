import { useState, useEffect } from "react";

import {
  getCustomerDetails,
  type CustomerDetailsResponse,
} from "../../../shared/services/customer.service";

export const useCustomerDetails = (customerId: string | undefined) => {
  const [data, setData] = useState<CustomerDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) {
        setError("Customer ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getCustomerDetails(customerId);
        console.log("Customer data received:", response); // TODO: Remove after debugging
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch customer details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch customer details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customerId]);

  const refetch = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getCustomerDetails(customerId);
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch customer details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch customer details",
      );
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
