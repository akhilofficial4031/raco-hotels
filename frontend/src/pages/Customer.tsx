import { Table, type TableProps } from "antd";
import { useMemo, useState } from "react";
import useSWR from "swr";

import TableHeader from "../shared/components/TableHeader";
import {
  type Customer,
  type CustomerListParam,
  type CustomerListResponse,
} from "../shared/models";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher } from "../utils/swrFetcher";

const CustomerPage = () => {
  const [filterParams, setFilterParams] = useState<CustomerListParam>({
    page: 1,
    limit: 10,
    search: "",
  });

  const queryString = useMemo(
    () => convertJsonToQueryParams(filterParams),
    [filterParams],
  );

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<CustomerListResponse>(`/customers?${queryString}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const columns: TableProps<Customer>["columns"] = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Total Bookings",
      dataIndex: "totalBookings",
      key: "totalBookings",
    },
  ];

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <TableHeader
        searchPlaceholder="customers"
        showAddButton={false}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.customers}
          className="!bg-white"
          bordered={true}
          columns={columns}
          rowKey="id"
          pagination={false}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default CustomerPage;
