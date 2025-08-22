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
  Tag,
  message,
  Typography,
} from "antd";
import { type ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import useSWR, { mutate } from "swr";

import AddEditHotel from "../features/hotels/components/AddEditHotel";
import TableHeader from "../shared/components/TableHeader";
import {
  type Hotel,
  type HotelListParamStructure,
  type HotelListResponse,
  type CreateHotelPayload,
  type HotelResponse,
} from "../shared/models/hotels";
import { convertJsonToQueryParams } from "../shared/utils";
import {
  fetcher,
  mutationFetcher,
  multipartMutationFetcher,
} from "../utils/swrFetcher";

const { confirm } = Modal;
const { Text } = Typography;

const Hotels = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isAddMode = location.pathname.includes("/add");
  const isEditMode = location.pathname.includes("/edit");
  const isFormMode = isAddMode || isEditMode;

  const [filterParams, setFilterParams] = useState<HotelListParamStructure>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    city: "",
    starRating: "",
  });

  const queryString = useMemo(
    () => convertJsonToQueryParams(filterParams),
    [filterParams],
  );

  const {
    data: response,
    isLoading,
    error,
  } = useSWR(
    !isFormMode ? `/hotels${queryString}` : null,
    fetcher<HotelListResponse>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  // Fetch individual hotel for edit mode
  const { data: hotelData } = useSWR(
    isEditMode && id ? `/hotels/${id}` : null,
    fetcher<HotelResponse>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    if (isEditMode && hotelData) {
      setCurrentHotel(hotelData.data.hotel);
    } else if (isAddMode) {
      setCurrentHotel(null);
    }
  }, [isEditMode, isAddMode, hotelData]);

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleAddHotel = () => {
    navigate("/hotels/add");
  };

  const handleEditHotel = (hotel: Hotel) => {
    navigate(`/hotels/edit/${hotel.id}`);
  };

  const handleDeleteHotel = (hotel: Hotel) => {
    confirm({
      title: "Are you sure you want to delete this hotel?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will permanently delete ${hotel.name}.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/hotels/${hotel.id}`, {
            arg: { method: "DELETE" },
          });
          message.success("Hotel deleted successfully");
          mutate(`/hotels${queryString}`);
        } catch (error) {
          if (error) {
            message.error("Failed to delete hotel");
          }
        }
      },
    });
  };

  const handleFormSubmit = async (
    data: CreateHotelPayload,
    images?: File[],
    replaceImages?: boolean,
  ) => {
    setIsSaving(true);
    try {
      // If images are provided, use multipart form data
      if (images && images.length > 0) {
        const formData = new FormData();
        formData.append("hotelData", JSON.stringify(data));

        // Add images
        images.forEach((image) => {
          formData.append("images", image);
        });

        // Add replaceImages flag for edit mode
        if (isEditMode && replaceImages !== undefined) {
          formData.append("replaceImages", replaceImages.toString());
        }

        if (isEditMode && currentHotel) {
          await multipartMutationFetcher(`/hotels/${currentHotel.id}`, {
            arg: { method: "PUT", formData },
          });
          message.success("Hotel updated successfully");
        } else {
          await multipartMutationFetcher("/hotels", {
            arg: { method: "POST", formData },
          });
          message.success("Hotel added successfully");
        }
      } else {
        // No images, use regular JSON request
        if (isEditMode && currentHotel) {
          await mutationFetcher(`/hotels/${currentHotel.id}`, {
            arg: { method: "PUT", body: data },
          });
          message.success("Hotel updated successfully");
        } else {
          await mutationFetcher("/hotels", {
            arg: { method: "POST", body: data },
          });
          message.success("Hotel added successfully");
        }
      }
      navigate("/hotels");
    } catch (error) {
      if (error) {
        message.error("Failed to save hotel");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormCancel = () => {
    navigate("/hotels");
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const getStatusTag = (isActive: number) => {
    return isActive === 1 ? (
      <Tag color="green">Active</Tag>
    ) : (
      <Tag color="red">Inactive</Tag>
    );
  };

  const getStarRating = (rating: number | null) => {
    if (!rating) return <Text type="secondary">Not rated</Text>;
    return (
      <div className="flex items-center gap-1">
        <span>{rating}</span>
        <span className="text-yellow-500">★</span>
      </div>
    );
  };

  const columns: ColumnsType<Hotel> = [
    {
      title: "Hotel Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Hotel) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.slug && (
            <Text type="secondary" className="text-xs">
              {record.slug}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_: unknown, record: Hotel) => (
        <div>
          {record.city && record.state ? (
            <div>
              {record.city}, {record.state}
            </div>
          ) : (
            <Text type="secondary">No location</Text>
          )}
          {record.countryCode && (
            <Text type="secondary" className="text-xs">
              {record.countryCode}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_: unknown, record: Hotel) => (
        <div>
          {record.email && <div className="text-sm">{record.email}</div>}
          {record.phone && (
            <Text type="secondary" className="text-xs">
              {record.phone}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "starRating",
      key: "starRating",
      render: getStarRating,
    },
    {
      title: "Check Times",
      key: "checkTimes",
      render: (_: unknown, record: Hotel) => (
        <div>
          {record.checkInTime && (
            <div className="text-sm">In: {record.checkInTime}</div>
          )}
          {record.checkOutTime && (
            <Text type="secondary" className="text-xs">
              Out: {record.checkOutTime}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: getStatusTag,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Hotel) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEditHotel(record)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteHotel(record)}
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

  if (isFormMode) {
    return (
      <AddEditHotel
        hotel={currentHotel}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isSaving={isSaving}
      />
    );
  }

  return (
    <div>
      <TableHeader
        searchPlaceholder="hotels"
        showAddButton={true}
        showFilter={false}
        onFilterClick={() => {}}
        addButtonOnClick={handleAddHotel}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data.hotels || []}
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
            total={response?.data.pagination.total || 0}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Hotels;
