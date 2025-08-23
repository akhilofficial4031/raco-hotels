import {
  BankOutlined,
  BookOutlined,
  CreditCardOutlined,
  HomeOutlined,
  SettingOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const SIDEBAR_ITEMS = [
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
    label: "Reviews",
    icon: <BookOutlined />,
    path: "/reviews",
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
      {
        label: "Room Types",
        icon: <ShopOutlined />,
        path: "/room-types",
      },
      {
        label: "Addons",
        icon: <SettingOutlined />,
        path: "/addons",
      },
    ],
  },
];
