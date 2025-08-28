import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, type MenuProps, Space } from "antd";

import Breadcrumbs from "./Breadcrumbs";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../hooks/useSidebar";
import { mutationFetcher } from "../../utils/swrFetcher";

const Header = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await mutationFetcher<{}, void>("/auth/logout", {
        arg: {
          method: "POST",
        },
      });
    } catch (error) {
      console.error("Logout API error:", error);
      // Even if the API call fails, we should still log out locally
    } finally {
      // Use the auth context logout method
      logout();
    }
  };

  const items: MenuProps["items"] = [
    {
      label: (
        <>
          <span className="text-gray-800">{user?.email || "Unknown User"}</span>
          <p className="text-gray-500 text-xs">{user?.role || "User"}</p>
        </>
      ),
      key: "0",
    },
    {
      type: "divider",
    },
    {
      label: <span className="text-red-500 hover:text-red-600">Logout</span>,
      key: "1",
      onClick: handleLogout,
    },
  ];
  return (
    <div
      className={`h-16 fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isOpen ? "left-60" : "left-14"
      }`}
    >
      <div className="p-4  flex justify-between items-center">
        <div className="flex  gap-2 items-center">
          <Button
            icon={
              isOpen ? (
                <DoubleLeftOutlined className="!text-2xl !text-gray-500" />
              ) : (
                <DoubleRightOutlined className="!text-2xl !text-gray-500" />
              )
            }
            type="text"
            size="large"
            onClick={toggleSidebar}
          />
          <Breadcrumbs />
        </div>
        <div>
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            className="!cursor-pointer"
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar
                  className="!cursor-pointer"
                  size="large"
                  icon={<UserOutlined className="!text-slate-900" />}
                />
              </Space>
            </a>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Header;
