import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";

import FullScreenSpinner from "./shared/components/FullScreenSpinner";
import { AuthLayout, UnAuthLayout } from "./shared/layouts";

// Lazy load page components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/Not-found"));
const Users = lazy(() => import("./pages/Users"));

// Helper function to wrap lazy components with Suspense
const withSuspense = (Component: React.ComponentType) => {
  return function SuspenseWrapper(props: any) {
    return (
      <Suspense fallback={<FullScreenSpinner />}>
        <Component {...props} />
      </Suspense>
    );
  };
};

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
        Component: withSuspense(Dashboard),
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
            Component: withSuspense(Users),
          },
          {
            path: "new",
            Component: withSuspense(Users), // For demo purposes, using same component
            handle: {
              crumb: () => ({
                label: "Add New User",
                href: "/users/new",
              }),
            },
          },
          {
            path: ":id",
            Component: withSuspense(Users), // For demo purposes, using same component
            handle: {
              crumb: () => ({
                label: "User Details",
                href: "/users/details",
              }),
            },
          },
        ],
      },
      {
        path: "*",
        Component: withSuspense(NotFound),
      },
    ],
  },
  {
    Component: UnAuthLayout,
    children: [
      {
        path: "/login",
        Component: withSuspense(Login),
      },
    ],
  },
]);

export default router;
