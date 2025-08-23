import {
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  type MenuProps,
  Pagination,
  Rate,
  Table,
  message,
} from "antd";
import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import TableHeader from "../shared/components/TableHeader";
import {
  type ReviewListParamStructure,
  type ReviewListResponse,
  type Review,
} from "../shared/models";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher, mutationFetcher } from "../utils/swrFetcher";

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

  const { trigger: updateReview } = useSWRMutation(
    "/reviews",
    async (
      url: string,
      { arg }: { arg: { id: number; status: "Approved" | "Rejected" } },
    ) => {
      const response = await mutationFetcher(`${url}/${arg.id}`, {
        arg: {
          method: "PUT",
          body: { status: arg.status },
        },
      });
      return response as ReviewListResponse;
    },
  );

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
      render: (text: number) => (
        <Rate
          character={<StarFilled />}
          allowHalf
          defaultValue={text}
          disabled
        />
      ),
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
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Review) => {
        const items: MenuProps["items"] = [
          {
            key: "Approved",
            icon: <CheckOutlined />,
            label: "Approve",
            disabled: record.status === "Approved",
          },
          {
            key: "Rejected",
            icon: <CloseOutlined />,
            label: "Reject",
            disabled: record.status === "Rejected",
          },
        ];

        const handleMenuClick = ({ key }: { key: string }) => {
          handleUpdateReviewStatus(record, key as "Approved" | "Rejected");
        };

        return (
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const handleUpdateReviewStatus = async (
    record: Review,
    status: "Approved" | "Rejected",
  ) => {
    try {
      await updateReview({ id: Number(record.id), status });
      message.success(`Review ${status} successfully`);

      // Revalidate the reviews list to reflect the updated status
      mutate(`/reviews${queryString}`);
    } catch (error) {
      console.error(`Error updating review status:`, error);
      message.error(`Failed to ${status} review`);
    }
  };

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
