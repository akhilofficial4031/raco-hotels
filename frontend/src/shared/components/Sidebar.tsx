import {
  BankOutlined,
  BookOutlined,
  CreditCardOutlined,
  HomeOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
      label: "Users",
      icon: <UserOutlined />,
      path: "/users",
    },
  ];
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
      <div className="flex flex-col gap-2 mt-[50px]">
        {sidebarItems.map((item) => (
          <Link
            to={item.path}
            key={item.label}
            className={`${isOpen ? "border-l-4" : "border-l-0"} flex items-center gap-2 text-gray-100 hover:text-gray-300 hover:bg-[#090f21] py-3 px-5 border-transparent ${
              location.pathname.includes(item.path)
                ? "bg-[#090f21] !border-blue-600 !text-blue-600"
                : ""
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {item.icon}
              {item.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
