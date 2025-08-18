import { createBrowserRouter, Navigate } from "react-router";

import { Dashboard, Login, Users, NotFound, Amenities } from "./pages";
import { AuthLayout, UnAuthLayout } from "./shared/layouts";

const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthLayout,
    handle: {
      crumb: () => ({
        label: "Dashboard",
        href: "/dashboard",
      }),
    },
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        Component: Dashboard,
        handle: {
          crumb: () => ({
            label: "Dashboard",
            href: "/dashboard",
          }),
        },
      },
      {
        path: "users",
        handle: {
          crumb: () => ({
            label: "Users",
            href: "/users",
          }),
        },
        children: [
          {
            index: true,
            Component: Users,
          },
        ],
      },
      {
        path: "amenities",
        Component: Amenities,
        handle: {
          crumb: () => ({
            label: "Amenities",
            href: "/amenities",
          }),
        },
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
  {
    Component: UnAuthLayout,
    children: [
      {
        path: "/login",
        Component: Login,
      },
    ],
  },
]);

export default router;
