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
import { useEffect, useMemo, useState } from "react";
import useSWR, { mutate } from "swr";

import AddEditUser from "../features/users/add-edit-user";
import TableHeader from "../shared/components/TableHeader";
import {
  type User,
  type UserListParamStructure,
  type UserListResponse,
  type CreateUserPayload,
} from "../shared/models/users";
import { convertJsonToQueryParams } from "../shared/utils";
import { fetcher, mutationFetcher } from "../utils/swrFetcher";

const { confirm } = Modal;

const Users = () => {
  const [openAddUserPanel, setOpenAddUserPanel] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [filterParams, setFilterParams] = useState<UserListParamStructure>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    role: "",
  });

  const queryString = useMemo(
    () => convertJsonToQueryParams(filterParams),
    [filterParams],
  );

  const {
    data: response,
    isLoading,
    error,
  } = useSWR(`/users${queryString}`, fetcher<UserListResponse>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const handlePageChange = (page: number, pageSize: number) => {
    setFilterParams((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setOpenAddUserPanel(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setOpenAddUserPanel(true);
  };

  const handleDeleteUser = (user: User) => {
    confirm({
      title: "Are you sure you want to delete this user?",
      icon: <ExclamationCircleOutlined />,
      content: `This action will permanently delete ${user.fullName}.`,
      onOk: async () => {
        try {
          await mutationFetcher(`/users/${user.id}`, {
            arg: { method: "DELETE" },
          });
          message.success("User deleted successfully");
          mutate(`/users${queryString}`);
        } catch (error) {
          if (error) {
            message.error("Failed to delete user");
          }
        }
      },
    });
  };

  const handleFormSubmit = async (data: CreateUserPayload) => {
    setIsSaving(true);
    try {
      if (currentUser) {
        await mutationFetcher(`/users/${currentUser.id}`, {
          arg: { method: "PUT", body: data },
        });
        message.success("User updated successfully");
      } else {
        await mutationFetcher("/users", {
          arg: { method: "POST", body: data },
        });
        message.success("User added successfully");
      }
      setOpenAddUserPanel(false);
      setCurrentUser(null);
      mutate(`/users${queryString}`);
    } catch (error) {
      if (error) {
        message.error("Failed to save user");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilterParams((prev) => ({ ...prev, search: value }));
  };

  const columns: ColumnsType<User> = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Joined At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: User) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => handleEditUser(record)}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteUser(record)}
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

  // if (isLoading) {
  //   return <FullScreenSpinner />;
  // }

  useEffect(() => {
    if (response?.data.users) {
      setFilteredUsers(
        response?.data.users.filter(
          (user) => user?.email !== loggedInUser?.email,
        ),
      );
    }
  }, [response]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div>
      <TableHeader
        searchPlaceholder="users"
        showAddButton={true}
        showFilter={false}
        onFilterClick={() => {}}
        addButtonOnClick={handleAddUser}
        onSearch={handleSearch}
      />
      <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200">
        <Table
          dataSource={filteredUsers}
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
      <AddEditUser
        open={openAddUserPanel}
        onClose={() => setOpenAddUserPanel(false)}
        onSubmit={handleFormSubmit}
        user={currentUser}
        isSaving={isSaving}
      />
    </div>
  );
};

export default Users;
