import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, MenuProps, Space } from "antd";
import { useSidebar } from "../hooks/useSidebar";

const Header = () => {
  const { isOpen, toggleSidebar } = useSidebar();

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
    },
  ];
  return (
    <div
      className={`h-16 fixed top-0 left-0 right-0 transition-all duration-300 bg-white border-b border-gray-200 ${
        isOpen ? "left-60" : "left-20"
      }`}
    >
      <div className="p-4  flex justify-between items-center">
        <div>
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
