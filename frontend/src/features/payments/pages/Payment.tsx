import { Pagination, Table, Tag, Typography } from "antd";
import { type ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import useSWR from "swr";

import TableHeader from "@shared/components/TableHeader";
import { APP_LOCALE } from "@shared/constants/app";
import { convertJsonToQueryParams } from "@utils/queryParams";
import { fetcher } from "@utils/swrFetcher";

import {
  type PaymentDto,
  type PaymentListParamStructure,
  type PaymentListResponse,
} from "../types/payment";

const { Text } = Typography;

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  succeeded: "green",
  paid: "green",
  pending: "orange",
  failed: "red",
  refunded: "blue",
  partially_refunded: "cyan",
  cancelled: "volcano",
};

const Payment = () => {
  const navigate = useNavigate();

  const [filterParams, setFilterParams] = useState<PaymentListParamStructure>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });

  const queryString = useMemo(
    () => convertJsonToQueryParams(filterParams),
    [filterParams],
  );

  const {
    data: response,
    isLoading,
    error,
  } = useSWR(`/payments${queryString}`, fetcher<PaymentListResponse>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const formatAmount = (amountCents: number, currencyCode: string) =>
    new Intl.NumberFormat(APP_LOCALE, {
      style: "currency",
      currency: currencyCode || "INR",
    }).format(amountCents / 100);

  const columns: ColumnsType<PaymentDto> = [
    {
      title: "Booking Ref.",
      dataIndex: "bookingReferenceCode",
      key: "bookingReferenceCode",
      render: (refCode: string | null, record: PaymentDto) =>
        refCode ? (
          <Text
            className="cursor-pointer text-blue-600 hover:underline"
            onClick={() => navigate(`/bookings/${record.bookingId}`)}
          >
            {refCode}
          </Text>
        ) : (
          <Text type="secondary">#{record.bookingId}</Text>
        ),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_: unknown, record: PaymentDto) => (
        <Text strong>
          {formatAmount(record.amountCents, record.currencyCode)}
        </Text>
      ),
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
      render: (status: string) => (
        <Tag color={PAYMENT_STATUS_COLORS[status] ?? "default"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      render: (method: string) => <Text className="capitalize">{method}</Text>,
    },
    {
      title: "Processor",
      dataIndex: "processor",
      key: "processor",
      render: (processor: string) => (
        <Text className="capitalize">{processor}</Text>
      ),
    },
    {
      title: "Processor Payment ID",
      dataIndex: "processorPaymentId",
      key: "processorPaymentId",
      render: (id: string | null) =>
        id ? <Text copyable>{id}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(APP_LOCALE),
    },
  ];

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <TableHeader
        searchPlaceholder="payments by booking ref. or processor ID"
        showAddButton={false}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data?.payments || []}
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
            total={response?.data?.pagination?.total || 0}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;
