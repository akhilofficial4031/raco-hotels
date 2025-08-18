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
} from "antd";
import { type ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";

import TableHeader from "../shared/components/TableHeader";
import { iconList } from "../shared/constants/icons";
import {
  type Amenity,
  type AmenityListParamStructure,
  type AmenityListResponse,
} from "../shared/models";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher, mutationFetcher } from "../utils/swrFetcher";

const { confirm } = Modal;

const Amenities = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("");
  const [isIconModalVisible, setIsIconModalVisible] = useState(false);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedAmenity, setEditedAmenity] = useState<Amenity | null>(null);

  const [filterParams, setFilterParams] = useState<AmenityListParamStructure>({
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
  } = useSWR(`/amenities${queryString}`, fetcher<AmenityListResponse>, {
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
    if (!newAmenityName || !selectedIcon) {
      message.error("Please provide a name and select an icon.");
      return;
    }
    try {
      await mutationFetcher("/amenities", {
        arg: {
          method: "POST",
          body: { name: newAmenityName, icon: selectedIcon },
        },
      });
      message.success("Amenity added successfully");
      mutate(`/amenities${queryString}`);
      setIsAdding(false);
      setNewAmenityName("");
      setSelectedIcon("");
    } catch (error) {
      message.error("Failed to add amenity");
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewAmenityName("");
    setSelectedIcon("");
  };

  const handleDeleteAmenity = (amenity: Amenity) => {
    confirm({
      title: "Are you sure you want to delete this amenity?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will permanently delete ${amenity.name}.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/amenities/${amenity.id}`, {
            arg: { method: "DELETE" },
          });
          message.success("Amenity deleted successfully");
          mutate(`/amenities${queryString}`);
        } catch (error) {
          message.error("Failed to delete amenity");
        }
      },
    });
  };

  const handleEdit = (record: Amenity) => {
    setEditingRowId(record.id);
    setEditedAmenity(record);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedAmenity(null);
  };

  const handleSave = async () => {
    if (!editedAmenity) return;
    try {
      await mutationFetcher(`/amenities/${editedAmenity.id}`, {
        arg: {
          method: "PUT",
          body: { name: editedAmenity.name, icon: editedAmenity.icon },
        },
      });
      message.success("Amenity updated successfully");
      mutate(`/amenities${queryString}`);
      setEditingRowId(null);
      setEditedAmenity(null);
    } catch (error) {
      message.error("Failed to update amenity");
    }
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value }));
  };

  const columns: ColumnsType<Amenity> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Amenity) =>
        editingRowId === record.id ? (
          <Input
            value={editedAmenity?.name}
            onChange={(e) =>
              setEditedAmenity(
                (prev) => ({ ...prev, name: e.target.value }) as Amenity,
              )
            }
          />
        ) : (
          text
        ),
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      render: (icon: string, record: Amenity) =>
        editingRowId === record.id ? (
          <Button
            onClick={() => {
              setIsIconModalVisible(true);
            }}
          >
            {editedAmenity?.icon ? (
              <i className={`fa ${editedAmenity.icon}`} />
            ) : (
              "Select Icon"
            )}
          </Button>
        ) : (
          <i className={`fa ${icon}`} />
        ),
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
      render: (_: unknown, record: Amenity) => {
        if (editingRowId === record.id) {
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
                  onClick={() => handleDeleteAmenity(record)}
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

  const newAmenityRow = {
    id: -1,
    name: (
      <Input
        placeholder="Amenity Name"
        value={newAmenityName}
        onChange={(e) => setNewAmenityName(e.target.value)}
      />
    ),
    icon: (
      <Button onClick={() => setIsIconModalVisible(true)}>
        {selectedIcon ? <i className={`fa ${selectedIcon}`} /> : "Select Icon"}
      </Button>
    ),
    createdAt: "",
    actions: (
      <div className="flex gap-2">
        <Button icon={<SaveOutlined />} onClick={handleSaveNewAmenity}>
          Save
        </Button>
        <Button icon={<CloseOutlined />} onClick={handleCancelAdd}>
          Cancel
        </Button>
      </div>
    ),
  };

  return (
    <div>
      <TableHeader
        searchPlaceholder="amenities"
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
              ? [newAmenityRow, ...(response?.data.amenities || [])]
              : response?.data.amenities
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
      <Modal
        title="Select Icon"
        visible={isIconModalVisible}
        onCancel={() => setIsIconModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="grid grid-cols-8 gap-4 max-h-96 overflow-y-auto">
          {iconList.map((icon) => (
            <div
              key={icon}
              className="flex items-center justify-center p-2 border rounded-md cursor-pointer hover:bg-gray-200"
              onClick={() => {
                if (editingRowId) {
                  setEditedAmenity((prev) => ({ ...prev, icon }) as Amenity);
                } else {
                  setSelectedIcon(icon);
                }
                setIsIconModalVisible(false);
              }}
            >
              <i className={`fa ${icon} text-2xl`} />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
export default Amenities;
