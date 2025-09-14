import {
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import TableHeader from "@shared/components/TableHeader";
import { APP_LOCALE } from "@shared/constants/app";
import {
  type Booking,
  type BookingListParamStructure,
  type BookingListResponse,
} from "@shared/models/bookings";
import { convertJsonToQueryParams } from "@shared/utils";
import {
  Button,
  Dropdown,
  type MenuProps,
  Modal,
  Pagination,
  Table,
  Tag,
  message,
} from "antd";
import { type ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import useSWR, { mutate } from "swr";

import { fetcher, mutationFetcher } from "../../../utils/swrFetcher";
import BookingFilters from "../components/BookingFilters";

const { confirm } = Modal;

const Bookings = () => {
  const navigate = useNavigate();
  const [filterParams, setFilterParams] = useState<BookingListParamStructure>({
    page: 1,
    limit: 10,
    query: "",
    status: "",
    hotelId: "",
  });
  const [openFiltersPanel, setOpenFiltersPanel] = useState(false);

  const queryString = useMemo(
    () => convertJsonToQueryParams(filterParams),
    [filterParams],
  );

  const {
    data: response,
    isLoading,
    error,
  } = useSWR(`/bookings${queryString}`, fetcher<BookingListResponse>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleCancelBooking = (booking: Booking) => {
    confirm({
      title: "Are you sure you want to cancel this booking?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will cancel booking ${booking.referenceCode}.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/bookings/${booking.id}/cancel`, {
            arg: { method: "PATCH" },
          });
          message.success("Booking cancelled successfully");
          mutate(`/bookings${queryString}`);
        } catch (err) {
          if (err) {
            message.error("Failed to cancel booking");
          }
        }
      },
    });
  };

  const handleCheckoutBooking = (booking: Booking) => {
    confirm({
      title: "Are you sure you want to check out this booking?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will check out booking ${booking.referenceCode}.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/bookings/${booking.id}/checkout`, {
            arg: { method: "PATCH" },
          });
          message.success("Booking checked out successfully");
          mutate(`/bookings${queryString}`);
        } catch (err) {
          if (err) {
            message.error("Failed to check out booking");
          }
        }
      },
    });
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, query: value, page: 1 }));
  };

  const handleApplyFilters = (filters: Partial<BookingListParamStructure>) => {
    setFilterParams((prev) => ({ ...prev, ...filters }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "green";
      case "pending":
        return "orange";
      case "cancelled":
        return "red";
      case "reserved":
        return "blue";
      case "checkedin":
        return "blue";
      case "checkedout":
        return "purple";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<Booking> = [
    {
      title: "Reference Code",
      dataIndex: "referenceCode",
      key: "referenceCode",
    },
    {
      title: "Hotel",
      dataIndex: "hotelName",
      key: "hotelName",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Check-in",
      dataIndex: "checkInDate",
      key: "checkInDate",
      render: (text: string) => new Date(text).toLocaleDateString(APP_LOCALE),
    },
    {
      title: "Check-out",
      dataIndex: "checkOutDate",
      key: "checkOutDate",
      render: (text: string) => new Date(text).toLocaleDateString(APP_LOCALE),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmountCents",
      key: "totalAmountCents",
      render: (amount: number, record: Booking) =>
        `${new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: record.currencyCode,
        }).format(amount / 100)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Booking) => {
        const menuItems = [
          {
            key: "view",
            icon: <EyeOutlined />,
            label: "View Details",
            onClick: () => navigate(`/bookings/${record.id}`),
          },
          {
            key: "edit",
            icon: <EditOutlined />,
            label: "Edit",
            onClick: () => navigate(`/bookings/${record.id}/edit`),
          },
          record.status === "confirmed" && {
            key: "checkin",
            icon: <LoginOutlined />,
            label: "Check In",
            onClick: () => navigate(`/bookings/${record.id}/checkin`),
          },
          record.status === "checkedin" && {
            key: "checkout",
            icon: <CheckCircleOutlined />,
            label: "Checkout",
            onClick: () => handleCheckoutBooking(record),
          },
          (record.status === "confirmed" || record.status === "checkedin") && {
            key: "cancel",
            icon: <CloseCircleOutlined />,
            label: "Cancel",
            onClick: () => handleCancelBooking(record),
          },
        ].filter(Boolean) as Required<MenuProps>["items"];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <TableHeader
        searchPlaceholder="Bookings"
        showAddButton // No "Add Booking" button on this page
        addButtonOnClick={() => navigate("/bookings/new")}
        onSearch={handleSearch}
        showFilter
        onFilterClick={() => setOpenFiltersPanel(true)}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data.bookings || []}
          className="!bg-white"
          bordered
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
      <BookingFilters
        open={openFiltersPanel}
        onClose={() => setOpenFiltersPanel(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filterParams}
      />
    </div>
  );
};

export default Bookings;
