import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Menu,
  Modal,
  Pagination,
  Table,
  message,
  Input,
  Select,
} from "antd";
import { type ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";

import TableHeader from "../shared/components/TableHeader";
import {
  type Addon,
  type AddonListParamStructure,
  type AddonListResponse,
} from "../shared/models";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher, mutationFetcher } from "../utils/swrFetcher";

const { confirm } = Modal;

const Addons = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAddonName, setNewAddonName] = useState("");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedAddon, setEditedAddon] = useState<Addon | null>(null);

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

  const handleAddAmenity = () => {
    setIsAdding(true);
  };

  const handleSaveNewAmenity = async () => {
    if (!newAddonName) {
      message.error("Please provide a name.");
      return;
    }
    try {
      await mutationFetcher("/addons", {
        arg: {
          method: "POST",
          body: {
            name: newAddonName,
            category: "",
            unitType: "",
            isActive: 1,
          },
        },
      });
      message.success("Amenity added successfully");
      mutate(`/addons${queryString}`);
      setIsAdding(false);
      setNewAddonName("");
    } catch (_error) {
      if (_error) {
        message.error("Failed to add amenity");
      }
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewAddonName("");
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

  const handleEdit = (record: Addon) => {
    setEditingRowId(record.id);
    setEditedAddon(record);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedAddon(null);
  };

  const handleSave = async () => {
    if (!editedAddon) return;
    try {
      await mutationFetcher(`/addons/${editedAddon.id}`, {
        arg: {
          method: "PUT",
          body: {
            name: editedAddon.name,
            category: editedAddon.category,
            unitType: editedAddon.unitType,
            isActive: editedAddon.isActive,
          },
        },
      });
      message.success("Addon updated successfully");
      mutate(`/addons${queryString}`);
      setEditingRowId(null);
      setEditedAddon(null);
    } catch (_error) {
      if (_error) {
        message.error("Failed to update addon");
      }
    }
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value }));
  };

  const categories = [
    { value: "bed", label: "Bed" },
    { value: "food", label: "Food" },
    { value: "service", label: "Service" },
    { value: "amenity", label: "Amenity" },
  ];

  const columns: ColumnsType<Addon> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Addon) => {
        if (record.id === -1) {
          // New row case
          return (
            <Input
              placeholder="Addon Name"
              value={newAddonName}
              onChange={(e) => setNewAddonName(e.target.value)}
            />
          );
        }
        if (editingRowId === record.id) {
          // Edit mode case
          return (
            <Input
              value={editedAddon?.name}
              onChange={(e) =>
                setEditedAddon(
                  (prev) => ({ ...prev, name: e.target.value }) as Addon,
                )
              }
            />
          );
        }
        // Normal display case
        return text;
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string | null, record: Addon) => {
        if (record.id === -1) {
          // New row case
          return (
            <Select
              value={editedAddon?.category}
              onChange={(value) =>
                setEditedAddon(
                  (prev) => ({ ...prev, category: value }) as Addon,
                )
              }
              options={categories.map((category) => ({
                label: category.label,
                value: category.value,
              }))}
            />
          );
        }
        // Normal display case
        return category;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string, record: Addon) => {
        if (record.id === -1) {
          // New row case - don't show created date
          return null;
        }
        return new Date(text).toLocaleDateString();
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Addon) => {
        if (record.id === -1) {
          // New row case
          return (
            <div className="flex gap-2">
              <Button icon={<SaveOutlined />} onClick={handleSaveNewAmenity}>
                Save
              </Button>
              <Button icon={<CloseOutlined />} onClick={handleCancelAdd}>
                Cancel
              </Button>
            </div>
          );
        }
        if (editingRowId === record.id) {
          // Edit mode case
          return (
            <div className="flex gap-2">
              <Button icon={<SaveOutlined />} onClick={handleSave}>
                Save
              </Button>
              <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          );
        }
        // Normal display case
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="edit"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                >
                  Edit
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
        );
      },
    },
  ];

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const newAddonRow = {
    id: -1,
    name: newAddonName,
    category: "",
    unitType: "",
    isActive: 1,
  };

  return (
    <div>
      <TableHeader
        searchPlaceholder="addons"
        showAddButton={!isAdding}
        showFilter={false}
        onFilterClick={() => {}}
        addButtonOnClick={handleAddAmenity}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={
            isAdding
              ? [newAddonRow, ...(response?.data.addons || [])]
              : response?.data.addons
          }
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
    </div>
  );
};
export default Addons;
