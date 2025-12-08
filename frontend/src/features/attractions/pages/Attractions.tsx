import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { convertJsonToQueryParams } from "@utils/queryParams";
import { fetcher, mutationFetcher } from "@utils/swrFetcher";
import {
  Button,
  Dropdown,
  Modal,
  Pagination,
  Table,
  message,
  Typography,
} from "antd";
import { type ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import useSWR, { mutate } from "swr";

import TableHeader from "@shared/components/TableHeader";
import { APP_LOCALE } from "@shared/constants/app";

import AddEditAttraction from "../components/AddEditAttraction";
import {
  type Attraction,
  type AttractionListParamStructure,
  type AttractionListResponse,
  type CreateAttractionPayload,
  type AttractionResponse,
} from "../types/attraction";

const { confirm } = Modal;
const { Text } = Typography;

const Attractions = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [currentAttraction, setCurrentAttraction] = useState<Attraction | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const isAddMode = location.pathname.includes("/add");
  const isEditMode = location.pathname.includes("/edit");
  const isFormMode = isAddMode || isEditMode;

  const [filterParams, setFilterParams] =
    useState<AttractionListParamStructure>({
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
    isLoading,
    error,
  } = useSWR(
    !isFormMode ? `/attractions${queryString}` : null,
    fetcher<AttractionListResponse>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  // Fetch individual attraction for edit mode
  const { data: attractionData } = useSWR(
    isEditMode && id ? `/attractions/${id}` : null,
    fetcher<AttractionResponse>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    if (isEditMode && attractionData) {
      setCurrentAttraction(attractionData.data.attraction);
    } else if (isAddMode) {
      setCurrentAttraction(null);
    }
  }, [isEditMode, isAddMode, attractionData]);

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleAddAttraction = () => {
    navigate("/attractions/add");
  };

  const handleEditAttraction = (attraction: Attraction) => {
    navigate(`/attractions/edit/${attraction.id}`);
  };

  const handleDeleteAttraction = (attraction: Attraction) => {
    confirm({
      title: "Are you sure you want to delete this attraction?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will permanently delete ${attraction.name}.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/attractions/${attraction.id}`, {
            arg: { method: "DELETE" },
          });
          message.success("Attraction deleted successfully");
          mutate(`/attractions${queryString}`);
        } catch (error) {
          if (error) {
            message.error("Failed to delete attraction");
          }
        }
      },
    });
  };

  const handleFormSubmit = async (data: CreateAttractionPayload) => {
    setIsSaving(true);

    try {
      if (isEditMode && currentAttraction) {
        await mutationFetcher(`/attractions/${currentAttraction.id}`, {
          arg: { method: "PUT", body: data },
        });
        message.success("Attraction updated successfully");
      } else {
        await mutationFetcher("/attractions", {
          arg: { method: "POST", body: data },
        });
        message.success("Attraction added successfully");
      }
      navigate("/attractions");
    } catch (error) {
      if (error) {
        message.error("Failed to save attraction");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormCancel = () => {
    navigate("/attractions");
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const columns: ColumnsType<Attraction> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Attraction) => (
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
      title: "Hotel",
      dataIndex: "hotelName",
      key: "hotelName",
      render: (text: string) => text || <Text type="secondary">N/A</Text>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(APP_LOCALE),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Attraction) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                icon: <EditOutlined />,
                label: "Edit",
                onClick: () => handleEditAttraction(record),
              },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                label: "Delete",
                onClick: () => handleDeleteAttraction(record),
              },
            ],
          }}
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
      <AddEditAttraction
        attraction={currentAttraction}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isSaving={isSaving}
      />
    );
  }

  return (
    <div>
      <TableHeader
        searchPlaceholder="attractions"
        showAddButton={true}
        showFilter={false}
        onFilterClick={() => {}}
        addButtonOnClick={handleAddAttraction}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data.attractions || []}
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

export default Attractions;
