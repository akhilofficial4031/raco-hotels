import { Menu } from "antd";
import { Link, useLocation } from "react-router";

import { SIDEBAR_ITEMS } from "../constants/sidebar";
import { useSidebar } from "../hooks/useSidebar";
import { type SidebarItem } from "../models/sidebar";

// Helper function to convert sidebar items to Ant Design Menu items
const convertToMenuItems = (items: SidebarItem[]): any[] => {
  return items.map((item) => {
    if (item.children) {
      return {
        key: item.label,
        icon: item.icon,
        label: item.label,
        children: convertToMenuItems(item.children),
      };
    }
    return {
      key: item.path,
      icon: item.icon,
      label: <Link to={item.path}>{item.label}</Link>,
    };
  });
};

const Sidebar = () => {
  const { isOpen } = useSidebar();
  const location = useLocation();
  const sidebarItems: SidebarItem[] = SIDEBAR_ITEMS;

  const menuItems = convertToMenuItems(sidebarItems);

  const defaultOpenKey = sidebarItems.find((item) =>
    item.children?.some((child) => location.pathname.includes(child.path)),
  )?.label;

  // Find the selected menu item based on path inclusion
  const getSelectedKeys = () => {
    // First check if any child menu item path is included in current pathname
    for (const item of sidebarItems) {
      if (item.children) {
        for (const child of item.children) {
          if (location.pathname.includes(child.path)) {
            return [child.path];
          }
        }
      }
    }

    // Then check main menu items (excluding those with children)
    for (const item of sidebarItems) {
      if (!item.children && location.pathname.includes(item.path)) {
        return [item.path];
      }
    }

    return [];
  };

  const selectedKeys = getSelectedKeys();

  return (
    <aside
      className={`h-screen bg-white fixed  top-0 left-0 z-10 transition-all duration-300 ${
        isOpen ? "w-60" : "w-14"
      }`}
    >
      <div className="h-16 flex items-start justify-center flex-col">
        <h1 className="text-2xl text-left px-5 py-2 text-gray-800">
          {isOpen ? "Raco Hotels" : "R"}
        </h1>
      </div>
      <Menu
        theme="light"
        mode="inline"
        inlineCollapsed={!isOpen}
        className={`!bg-white transition-all duration-300 !w-full !border-none`}
        defaultSelectedKeys={selectedKeys}
        defaultOpenKeys={defaultOpenKey ? [defaultOpenKey] : []}
        selectedKeys={selectedKeys}
        items={menuItems}
      />
    </aside>
  );
};

export default Sidebar;
