import {
  BankOutlined,
  BookOutlined,
  CreditCardOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  ShopOutlined,
  TagOutlined,
  UserOutlined,
  WalletOutlined,
  AuditOutlined,
} from "@ant-design/icons";

export const SIDEBAR_ITEMS = [
  {
    label: "Dashboard",
    icon: <HomeOutlined />,
    path: "/dashboard",
  },
  {
    label: "Bookings",
    icon: <BookOutlined />,
    path: "/bookings",
  },
  {
    label: "Customers",
    icon: <UserOutlined />,
    path: "/customers",
  },
  {
    label: "Payments",
    icon: <CreditCardOutlined />,
    path: "/payments",
  },
  // {
  //   label: "Reviews",
  //   icon: <BookOutlined />,
  //   path: "/reviews",
  // },
  {
    label: "Configurations",
    icon: <SettingOutlined />,
    path: "/configurations",
    children: [
      {
        label: "Hotels",
        icon: <BankOutlined />,
        path: "/hotels",
      },
      {
        label: "Room Types",
        icon: <ShopOutlined />,
        path: "/room-types",
      },
      {
        label: "Rooms",
        icon: <ShopOutlined />,
        path: "/rooms",
      },
      {
        label: "Features",
        icon: <BookOutlined />,
        path: "/features",
      },
      {
        label: "Amenities",
        icon: <WalletOutlined />,
        path: "/amenities",
      },
      {
        label: "Addons",
        icon: <PlusCircleOutlined />,
        path: "/addons",
      },
      {
        label: "Attractions",
        icon: <BankOutlined />,
        path: "/attractions",
      },
      {
        label: "Promo Codes",
        icon: <TagOutlined />,
        path: "/promo-codes",
      },
      {
        label: "Users",
        icon: <UserOutlined />,
        path: "/users",
      },
      {
        label: "Cms",
        icon: <AuditOutlined />,
        path: "/cms",
      },
    ],
  },
];
