import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  CopyOutlined,
  MailOutlined,
  KeyOutlined,
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
  Typography,
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
const { Text } = Typography;

const Users = () => {
  const [openAddUserPanel, setOpenAddUserPanel] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [selectedUserForPassword, setSelectedUserForPassword] =
    useState<User | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
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

  const generatePassword = () => {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

    // Start with a random letter
    let newPassword = letters.charAt(
      Math.floor(Math.random() * letters.length),
    );

    // Ensure at least one lowercase, one uppercase, one number, and one symbol
    newPassword += letters
      .charAt(Math.floor(Math.random() * letters.length))
      .toLowerCase();
    newPassword += letters
      .charAt(Math.floor(Math.random() * letters.length))
      .toUpperCase();
    newPassword += numbers.charAt(Math.floor(Math.random() * numbers.length));
    newPassword += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill the rest of the password length with random characters
    const allCharacters = letters + numbers + symbols;
    const passwordLength = 12; // You can change the length as needed

    for (let i = newPassword.length; i < passwordLength; i++) {
      newPassword += allCharacters.charAt(
        Math.floor(Math.random() * allCharacters.length),
      );
    }

    // Shuffle the password to ensure randomness
    return shuffleString(newPassword);
  };

  const handleGeneratePassword = async (user: User) => {
    setSelectedUserForPassword(user);
    const newPassword = generatePassword();
    setGeneratedPassword(newPassword);

    // Update user password in database first
    const updatedUser: CreateUserPayload = {
      email: user.email,
      fullName: user.fullName || "",
      phone: user.phone || "",
      role: user.role,
      password: newPassword,
    };

    try {
      setIsSaving(true);
      await mutationFetcher(`/users/${user.id}`, {
        arg: { method: "PUT", body: updatedUser },
      });
      message.success("Password updated successfully");
      mutate(`/users${queryString}`);

      // Show modal with generated password
      setPasswordModalVisible(true);
    } catch (error) {
      if (error) {
        message.error("Failed to update password");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const shuffleString = (str: string) => {
    return str
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const handleCopyPassword = () => {
    navigator.clipboard
      .writeText(generatedPassword)
      .then(() => {
        message.success("Password copied to clipboard!");
      })
      .catch(() => {
        message.error("Failed to copy password");
      });
  };

  const handleSendEmail = async () => {
    if (!selectedUserForPassword) return;

    setSendingEmail(true);
    try {
      // TODO: Replace with actual email sending API endpoint
      await mutationFetcher("/send-password-email", {
        arg: {
          method: "POST",
          body: {
            email: selectedUserForPassword.email,
            password: generatedPassword,
            fullName: selectedUserForPassword.fullName,
          },
        },
      });
      message.success("Password sent via email successfully!");
    } catch {
      message.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleClosePasswordModal = () => {
    setPasswordModalVisible(false);
    setGeneratedPassword("");
    setSelectedUserForPassword(null);
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
              <Menu.Item
                key="generatePassword"
                icon={<KeyOutlined />}
                onClick={() => handleGeneratePassword(record)}
              >
                Generate Password
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

      {/* Password Generation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <KeyOutlined />
            <span>Generated Password</span>
          </div>
        }
        open={passwordModalVisible}
        onCancel={handleClosePasswordModal}
        footer={null}
        width={500}
        centered
      >
        <div className="py-4">
          <div className="mb-4">
            <Text strong>User: </Text>
            <Text>
              {selectedUserForPassword?.fullName} (
              {selectedUserForPassword?.email})
            </Text>
          </div>

          <div className="mb-6">
            <Text strong className="block mb-2">
              Generated Password:
            </Text>
            <Input.Group compact>
              <Input
                value={generatedPassword}
                readOnly
                className="font-mono text-lg"
                style={{ width: "calc(100% - 40px)" }}
              />
              <Button
                icon={<CopyOutlined />}
                onClick={handleCopyPassword}
                title="Copy to clipboard"
              />
            </Input.Group>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={handleSendEmail}
              loading={sendingEmail}
              size="large"
            >
              Send via Email
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
