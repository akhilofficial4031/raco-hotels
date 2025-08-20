import {
  BankOutlined,
  BookOutlined,
  CreditCardOutlined,
  HomeOutlined,
  SettingOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Link, useLocation } from "react-router";

import { useSidebar } from "../hooks/useSidebar";
import { type SidebarItem } from "../models/sidebar";

const Sidebar = () => {
  const { isOpen } = useSidebar();
  const location = useLocation();
  const sidebarItems: SidebarItem[] = [
    {
      label: "Dashboard",
      icon: <HomeOutlined />,
      path: "/dashboard",
    },
    {
      label: "Hotels",
      icon: <BankOutlined />,
      path: "/hotels",
    },
    {
      label: "Rooms",
      icon: <ShopOutlined />,
      path: "/rooms",
    },

    {
      label: "Bookings",
      icon: <BookOutlined />,
      path: "/bookings",
    },
    {
      label: "Payments",
      icon: <CreditCardOutlined />,
      path: "/payments",
    },

    {
      label: "Configurations",
      icon: <SettingOutlined />,
      path: "/configurations",
      children: [
        {
          label: "Users",
          icon: <UserOutlined />,
          path: "/users",
        },
        {
          label: "Features",
          icon: <SettingOutlined />,
          path: "/features",
        },
        {
          label: "Amenities",
          icon: <SettingOutlined />,
          path: "/amenities",
        },
      ],
    },
  ];

  const defaultOpenKey = sidebarItems.find((item) =>
    item.children?.some((child) => location.pathname.startsWith(child.path)),
  )?.label;

  return (
    <div
      className={`h-screen bg-slate-900 fixed top-0 left-0 z-10 transition-all duration-300 ${
        isOpen ? "w-60" : "w-14"
      }`}
    >
      <div className="h-16 flex items-start justify-center flex-col border-b-1 border-slate-800">
        <h1 className="text-2xl text-left px-5 py-2 text-gray-100">
          {isOpen ? "Raco Hotels" : "R"}
        </h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={!isOpen}
        className="bg-slate-900 border-r-0"
        defaultSelectedKeys={[location.pathname]}
        defaultOpenKeys={defaultOpenKey ? [defaultOpenKey] : []}
        selectedKeys={[location.pathname]}
      >
        {sidebarItems.map((item) =>
          item.children ? (
            <Menu.SubMenu key={item.label} icon={item.icon} title={item.label}>
              {item.children.map((child) => (
                <Menu.Item key={child.path} icon={child.icon}>
                  <Link to={child.path}>{child.label}</Link>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          ) : (
            <Menu.Item key={item.path} icon={item.icon}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ),
        )}
      </Menu>
    </div>
  );
};

export default Sidebar;
