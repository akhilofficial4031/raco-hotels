import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Menu,
  Modal,
  Pagination,
  Table,
  message,
  Tag,
  Typography,
} from "antd";
import { type ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";

import AddEditRoomType from "../features/room-type/add-edit-room-type";
import RoomTypeFilters from "../features/room-type/room-type-filters";
import TableHeader from "../shared/components/TableHeader";
import { type Hotel } from "../shared/models/hotels";
import {
  type RoomTypeListParamStructure,
  type RoomTypeListResponse,
  type CreateRoomTypePayload,
  type RoomTypeWithRelations,
} from "../shared/models/room-type";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher, mutationFetcher } from "../utils/swrFetcher";

const { confirm } = Modal;
const { Text } = Typography;

const RoomType = () => {
  const [openAddRoomTypePanel, setOpenAddRoomTypePanel] = useState(false);
  const [openFiltersPanel, setOpenFiltersPanel] = useState(false);
  const [currentRoomType, setCurrentRoomType] =
    useState<RoomTypeWithRelations | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [filterParams, setFilterParams] = useState<RoomTypeListParamStructure>({
    page: 1,
    limit: 10,
    search: "",
    hotelId: "",
    isActive: "",
  });

  const queryString = useMemo(
    () => convertJsonToQueryParams(filterParams),
    [filterParams],
  );

  // Fetch room types
  const {
    data: response,
    isLoading,
    error,
  } = useSWR(`/room-types${queryString}`, fetcher<RoomTypeListResponse>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  // Fetch hotels for filter dropdown
  const { data: hotelsResponse } = useSWR(
    "/hotels?limit=100",
    fetcher<{ data: { hotels: Hotel[] } }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleAddRoomType = () => {
    setCurrentRoomType(null);
    setOpenAddRoomTypePanel(true);
  };

  const handleEditRoomType = (roomType: RoomTypeWithRelations) => {
    setCurrentRoomType(roomType);
    setOpenAddRoomTypePanel(true);
  };

  const handleDeleteRoomType = (roomType: RoomTypeWithRelations) => {
    confirm({
      title: "Are you sure you want to delete this room type?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will permanently delete "${roomType.name}".`,
      onOk: async () => {
        try {
          await mutationFetcher(`/room-types/${roomType.id}`, {
            arg: { method: "DELETE" },
          });
          message.success("Room type deleted successfully");
          mutate(`/room-types${queryString}`);
        } catch (error) {
          if (error) {
            message.error("Failed to delete room type");
          }
        }
      },
    });
  };

  const handleFormSubmit = async (data: CreateRoomTypePayload) => {
    setIsSaving(true);
    try {
      if (currentRoomType) {
        await mutationFetcher(`/room-types/${currentRoomType.id}`, {
          arg: { method: "PUT", body: data },
        });
        message.success("Room type updated successfully");
      } else {
        await mutationFetcher("/room-types", {
          arg: { method: "POST", body: data },
        });
        message.success("Room type added successfully");
      }
      setOpenAddRoomTypePanel(false);
      setCurrentRoomType(null);
      mutate(`/room-types${queryString}`);
    } catch (error) {
      if (error) {
        message.error("Failed to save room type");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleApplyFilters = (filters: Partial<RoomTypeListParamStructure>) => {
    setFilterParams((prev) => ({ ...prev, ...filters }));
  };

  const handleOpenFilters = () => {
    setOpenFiltersPanel(true);
  };

  const hasActiveFilters = Boolean(
    filterParams.hotelId || filterParams.isActive,
  );

  const formatPrice = (priceCents: number, currencyCode: string) => {
    const price = priceCents / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode || "INR",
    }).format(price);
  };

  const getHotelName = (hotelId: number) => {
    const hotel = hotelsResponse?.data?.hotels?.find((h) => h.id === hotelId);
    return hotel?.name || `Hotel ${hotelId}`;
  };

  const columns: ColumnsType<RoomTypeWithRelations> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: RoomTypeWithRelations) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.slug}
          </Text>
        </div>
      ),
    },
    {
      title: "Hotel",
      dataIndex: "hotelId",
      key: "hotelId",
      render: (hotelId: number) => getHotelName(hotelId),
    },
    {
      title: "Occupancy",
      key: "occupancy",
      render: (_: unknown, record: RoomTypeWithRelations) => (
        <Text>
          {record.baseOccupancy} - {record.maxOccupancy} guests
        </Text>
      ),
    },
    {
      title: "Base Price",
      key: "price",
      render: (_: unknown, record: RoomTypeWithRelations) => (
        <Text strong>
          {formatPrice(record.basePriceCents, record.currencyCode)}
        </Text>
      ),
    },
    {
      title: "Size",
      dataIndex: "sizeSqft",
      key: "sizeSqft",
      render: (size: number | null) => (size ? `${size} sq ft` : "-"),
    },
    {
      title: "Bed Type",
      dataIndex: "bedType",
      key: "bedType",
      render: (bedType: string | null) => bedType || "-",
    },
    {
      title: "Total Rooms",
      dataIndex: "totalRooms",
      key: "totalRooms",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: number) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Amenities",
      key: "amenities",
      render: (_: unknown, record: RoomTypeWithRelations) => (
        <Text>{record.amenities?.length || 0} amenities</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: RoomTypeWithRelations) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEditRoomType(record)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteRoomType(record)}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <TableHeader
        searchPlaceholder="room types"
        showAddButton={true}
        showFilter={true}
        hasActiveFilters={hasActiveFilters}
        onFilterClick={handleOpenFilters}
        addButtonOnClick={handleAddRoomType}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data.roomTypes || []}
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
            total={response?.data.pagination?.total || 0}
            onChange={handlePageChange}
          />
        </div>
      </div>
      <AddEditRoomType
        open={openAddRoomTypePanel}
        onClose={() => setOpenAddRoomTypePanel(false)}
        onSubmit={handleFormSubmit}
        roomType={currentRoomType}
        isSaving={isSaving}
      />
      <RoomTypeFilters
        open={openFiltersPanel}
        onClose={() => setOpenFiltersPanel(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filterParams}
      />
    </div>
  );
};

export default RoomType;
