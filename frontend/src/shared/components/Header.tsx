import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, type MenuProps, Space } from "antd";
import { useNavigate } from "react-router";

import Breadcrumbs from "./Breadcrumbs";
import { mutationFetcher } from "../../utils/swrFetcher";
import { useSidebar } from "../hooks/useSidebar";

const Header = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await mutationFetcher<{}, void>("/auth/logout", {
        arg: {
          method: "POST",
        },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const items: MenuProps["items"] = [
    {
      label: (
        <>
          <span className="text-gray-800">admin@raco.com</span>
          <p className="text-gray-500 text-xs">Administrator</p>
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
                <MenuFoldOutlined className="!text-2xl" />
              ) : (
                <MenuUnfoldOutlined className="!text-2xl" />
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
