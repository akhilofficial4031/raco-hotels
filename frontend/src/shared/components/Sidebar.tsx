import { Link } from "react-router";
import { useSidebar } from "../hooks/useSidebar";
import { SidebarItem } from "../models/sidebar";
import {
  BankOutlined,
  BookOutlined,
  CreditCardOutlined,
  HomeOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";

const Sidebar = () => {
  const { isOpen } = useSidebar();
  const sidebarItems: SidebarItem[] = [
    {
      label: "Dashboard",
      icon: <HomeOutlined />,
      path: "/",
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
        isOpen ? "w-60" : "w-20"
      }`}
    >
      <div className="h-16 bg-[#090f21] flex items-start justify-center flex-col">
        <h1 className="text-2xl text-left px-5 py-2 text-white">
          {isOpen ? "Raco Hotels" : "R"}
        </h1>
      </div>
      <div className="flex flex-col gap-2 mt-[50px]">
        {sidebarItems.map((item) => (
          <Link
            to={item.path}
            key={item.label}
            className="flex items-center gap-2 text-white hover:text-gray-300 hover:bg-[#090f21] py-3 px-5 rounded-md"
          >
            <div className="flex items-center gap-3">
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
