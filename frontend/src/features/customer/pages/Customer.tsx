import { EyeOutlined } from "@ant-design/icons";
import { Button, Table, type TableProps } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import useSWR from "swr";

import TableHeader from "@shared/components/TableHeader";
import { convertJsonToQueryParams } from "@utils/queryParams";
import { fetcher } from "@utils/swrFetcher";

import {
  type Customer,
  type CustomerListParam,
  type CustomersListResponseSchema,
} from "../types/customer";

const CustomerPage = () => {
  const navigate = useNavigate();
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
  } = useSWR<CustomersListResponseSchema>(`/customers${queryString}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleViewCustomer = (record: Customer) => {
    navigate(`/customers/${record.id}`);
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
      title: "VIP Status",
      dataIndex: "vipStatus",
      key: "vipStatus",
    },
    {
      title: "Emergency Contact Phone",
      dataIndex: "emergencyContactPhone",
      key: "emergencyContactPhone",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          type="link"
          onClick={() => handleViewCustomer(record)}
        >
          View
        </Button>
      ),
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
          dataSource={response?.data.customers}
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
