import { Pagination, Table } from "antd";
import { useMemo, useState } from "react";
import useSWR from "swr";

import TableHeader from "../shared/components/TableHeader";
import {
  type ReviewListParamStructure,
  type ReviewListResponse,
} from "../shared/models";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher } from "../utils/swrFetcher";

const Reviews = () => {
  const [filterParams, setFilterParams] = useState<ReviewListParamStructure>({
    page: 1,
    limit: 10,
  });

  const queryString = useMemo(
    () => convertJsonToQueryParams(filterParams),
    [filterParams],
  );

  const {
    data: response,
    isLoading,
    error,
  } = useSWR(`/reviews${queryString}`, fetcher<ReviewListResponse>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const columns = [
    {
      title: "Hotel Name",
      dataIndex: "hotelName",
      key: "hotelName",
    },

    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
    },

    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
    },

    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },

    {
      title: "Body",
      dataIndex: "body",
      key: "body",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Published At",
      dataIndex: "publishedAt",
      key: "publishedAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
  ];

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <TableHeader searchPlaceholder="reviews" showAddButton={false} />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data.reviews}
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
            total={response?.data.pagination.total}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default Reviews;
