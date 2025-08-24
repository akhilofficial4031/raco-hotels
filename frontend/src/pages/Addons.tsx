import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  SettingOutlined,
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
import { useNavigate } from "react-router";
import useSWR, { mutate } from "swr";

import AddEditAddon from "../features/addon/add-edit-addon";
import TableHeader from "../shared/components/TableHeader";
import {
  type Addon,
  type AddonListParamStructure,
  type AddonListResponse,
  type CreateAddonPayload,
  type UpdateAddonPayload,
} from "../shared/models";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher, mutationFetcher } from "../utils/swrFetcher";

const { confirm } = Modal;

const Addons = () => {
  const navigate = useNavigate();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [filterParams, setFilterParams] = useState<AddonListParamStructure>({
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
  } = useSWR(`/addons${queryString}`, fetcher<AddonListResponse>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleAddAddon = () => {
    setSelectedAddon(null);
    setIsDrawerVisible(true);
  };

  const handleEditAddon = (addon: Addon) => {
    setSelectedAddon(addon);
    setIsDrawerVisible(true);
  };

  const handleViewConfiguration = (addon: Addon) => {
    navigate(`/addons/configuration/${addon.id}`);
  };

  const handleDeleteAddon = (addon: Addon) => {
    confirm({
      title: "Are you sure you want to delete this addon?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will permanently delete ${addon.name}.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/addons/${addon.id}`, {
            arg: { method: "DELETE" },
          });
          message.success("Addon deleted successfully");
          mutate(`/addons${queryString}`);
        } catch (_error) {
          if (_error) {
            message.error("Failed to delete addon");
          }
        }
      },
    });
  };

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    category?: string;
    unitType?: string;
  }) => {
    setIsSaving(true);
    try {
      if (selectedAddon) {
        // Edit mode
        const updatePayload: UpdateAddonPayload = {
          name: data.name,
          description: data.description || null,
          category: data.category || null,
          unitType: data.unitType || "",
          isActive: selectedAddon.isActive,
        };

        await mutationFetcher(`/addons/${selectedAddon.id}`, {
          arg: {
            method: "PUT",
            body: updatePayload,
          },
        });
        message.success("Addon updated successfully");
      } else {
        // Add mode
        const createPayload: CreateAddonPayload = {
          name: data.name,
          description: data.description || null,
          category: data.category || null,
          unitType: data.unitType || "",
          isActive: 1,
        };

        await mutationFetcher("/addons", {
          arg: {
            method: "POST",
            body: createPayload,
          },
        });
        message.success("Addon added successfully");
      }
      mutate(`/addons${queryString}`);
      setIsDrawerVisible(false);
      setSelectedAddon(null);
    } catch (_error) {
      if (_error) {
        message.error(
          selectedAddon ? "Failed to update addon" : "Failed to add addon",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const columns: ColumnsType<Addon> = [
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
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text: string | null) => text || "-",
    },
    {
      title: "Unit Type",
      dataIndex: "unitType",
      key: "unitType",
      render: (text: string) => text || "-",
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
      render: (_: unknown, record: Addon) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEditAddon(record)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="config"
                icon={<SettingOutlined />}
                onClick={() => handleViewConfiguration(record)}
              >
                View Configuration
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteAddon(record)}
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
        searchPlaceholder="addons"
        showAddButton={true}
        showFilter={false}
        onFilterClick={() => {}}
        addButtonOnClick={handleAddAddon}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={response?.data.addons}
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

      <AddEditAddon
        open={isDrawerVisible}
        onClose={() => {
          setIsDrawerVisible(false);
          setSelectedAddon(null);
        }}
        onSubmit={handleSubmit}
        addon={selectedAddon}
        isSaving={isSaving}
      />
    </div>
  );
};
export default Addons;
