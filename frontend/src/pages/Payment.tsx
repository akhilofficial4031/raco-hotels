import { Pagination, Table } from "antd";
import { useState } from "react";

import TableHeader from "../shared/components/TableHeader";

// NOTE: This is a temporary type definition.
// In the future, this should be replaced by a shared model from a centralized types definition file.
interface PaymentDto {
  id: number;
  bookingId: number;
  amountCents: number;
  currencyCode: string;
  status: string;
  method: string;
  processor: string;
  processorPaymentId: string | null;
  createdAt: string;
}

interface PaymentListParamStructure {
  page: number;
  limit: number;
  search: string;
}

const Payment = () => {
  const [filterParams, setFilterParams] = useState<PaymentListParamStructure>({
    page: 1,
    limit: 10,
    search: "",
  });

  // As per the requirement, we are using a hardcoded empty array for now.
  // This will be replaced with an API call in the future.
  const payments: PaymentDto[] = [];
  const isLoading = false;
  const totalPayments = 0;

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
    },
    {
      title: "Amount",
      dataIndex: "amountCents",
      key: "amountCents",
      render: (amount: number) => (amount / 100).toFixed(2),
    },
    {
      title: "Currency",
      dataIndex: "currencyCode",
      key: "currencyCode",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "Processor",
      dataIndex: "processor",
      key: "processor",
    },
    {
      title: "Processor Payment ID",
      dataIndex: "processorPaymentId",
      key: "processorPaymentId",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
  ];

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value }));
  };

  return (
    <>
      <TableHeader
        searchPlaceholder="payments"
        showAddButton={false}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={payments}
          className="!bg-white"
          bordered={true}
          columns={columns}
          rowKey="id"
          pagination={false}
          loading={isLoading}
          scroll={{ x: "max-content" }}
        />
        <div className="flex justify-end mt-4">
          <Pagination
            current={filterParams.page}
            pageSize={filterParams.limit}
            total={totalPayments}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default Payment;
