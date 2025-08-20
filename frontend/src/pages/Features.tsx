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
} from "antd";
import { type ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";

import AddEditFeature from "../features/feature/add-edit-feature";
import TableHeader from "../shared/components/TableHeader";
import {
  type Feature,
  type FeatureListParamStructure,
  type FeatureListResponse,
  type CreateFeaturePayload,
  type UpdateFeaturePayload,
} from "../shared/models/featuers";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher, mutationFetcher } from "../utils/swrFetcher";

const { confirm } = Modal;

const Features = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [filterParams, setFilterParams] = useState<FeatureListParamStructure>({
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
  } = useSWR(`/features${queryString}`, fetcher<FeatureListResponse>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleAddFeature = () => {
    setSelectedFeature(null);
    setIsDrawerVisible(true);
  };

  const handleEditFeature = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsDrawerVisible(true);
  };

  const handleDeleteFeature = (feature: Feature) => {
    confirm({
      title: "Are you sure you want to delete this feature?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will permanently delete ${feature.name}.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/features/${feature.id}`, {
            arg: { method: "DELETE" },
          });
          message.success("Feature deleted successfully");
          mutate(`/features${queryString}`);
        } catch (_error) {
          if (_error) {
            message.error("Failed to delete feature");
          }
        }
      },
    });
  };

  const handleSubmit = async (data: { name: string; description?: string }) => {
    setIsSaving(true);
    try {
      if (selectedFeature) {
        // Edit mode
        const updatePayload: UpdateFeaturePayload = {
          name: data.name,
          description: data.description || null,
          isVisible: selectedFeature.isVisible,
          sortOrder: selectedFeature.sortOrder,
        };

        await mutationFetcher(`/features/${selectedFeature.id}`, {
          arg: {
            method: "PUT",
            body: updatePayload,
          },
        });
        message.success("Feature updated successfully");
      } else {
        // Add mode
        const createPayload: CreateFeaturePayload = {
          code: data.name.toLowerCase().replace(/\s+/g, "-"),
          name: data.name,
          description: data.description || null,
          isVisible: true,
          sortOrder: 1,
        };

        await mutationFetcher("/features", {
          arg: {
            method: "POST",
            body: createPayload,
          },
        });
        message.success("Feature added successfully");
      }
      mutate(`/features${queryString}`);
      setIsDrawerVisible(false);
      setSelectedFeature(null);
    } catch (_error) {
      if (_error) {
        message.error(
          selectedFeature
            ? "Failed to update feature"
            : "Failed to add feature",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const columns: ColumnsType<Feature> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string | null) => text || "-",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Feature) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEditFeature(record)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteFeature(record)}
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
        searchPlaceholder="features"
        showAddButton={true}
        showFilter={false}
        onFilterClick={() => {}}
        addButtonOnClick={handleAddFeature}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data.features}
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

      <AddEditFeature
        open={isDrawerVisible}
        onClose={() => {
          setIsDrawerVisible(false);
          setSelectedFeature(null);
        }}
        onSubmit={handleSubmit}
        feature={selectedFeature}
        isSaving={isSaving}
      />
    </div>
  );
};

export default Features;
