import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";

import Hotels from "./pages/Hotels";
import FullScreenSpinner from "./shared/components/FullScreenSpinner";
import { AuthLayout, UnAuthLayout } from "./shared/layouts";

// Lazy load page components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/Not-found"));
const Users = lazy(() => import("./pages/Users"));
const Features = lazy(() => import("./pages/Features"));
const Amenities = lazy(() => import("./pages/Amenities"));
const RoomType = lazy(() => import("./pages/Room-type"));
const Rooms = lazy(() => import("./pages/Rooms"));
const AddRoomPage = lazy(() => import("./pages/rooms/AddRoomPage"));

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
        ],
      },
      {
        path: "amenities",
        Component: withSuspense(Amenities),
        handle: {
          crumb: () => ({
            label: "Amenities",
            href: "/amenities",
          }),
        },
      },
      {
        path: "features",
        Component: withSuspense(Features),
        handle: {
          crumb: () => ({
            label: "Features",
            href: "/features",
          }),
        },
      },
      {
        path: "room-types",
        Component: withSuspense(RoomType),
        handle: {
          crumb: () => ({
            label: "Room Types",
            href: "/room-types",
          }),
        },
      },
      {
        path: "rooms",
        handle: {
          crumb: () => ({
            label: "Rooms",
            href: "/rooms",
          }),
        },
        children: [
          {
            index: true,
            Component: withSuspense(Rooms),
          },
          {
            path: "add",
            Component: withSuspense(AddRoomPage),
            handle: {
              crumb: () => ({
                label: "Add Room",
                href: "/rooms/add",
              }),
            },
          },
          {
            path: "edit/:id",
            Component: withSuspense(Rooms),
            handle: {
              crumb: () => ({
                label: "Edit Room",
                href: "/rooms",
              }),
            },
          },
        ],
      },
      {
        path: "hotels",
        handle: {
          crumb: () => ({
            label: "Hotels",
            href: "/hotels",
          }),
        },
        children: [
          {
            index: true,
            Component: withSuspense(Hotels),
          },
          {
            path: "add",
            Component: withSuspense(Hotels),
            handle: {
              crumb: () => ({
                label: "Add Hotel",
                href: "/hotels/add",
              }),
            },
          },
          {
            path: "edit/:id",
            Component: withSuspense(Hotels),
            handle: {
              crumb: () => ({
                label: "Edit Hotel",
                href: "/hotels",
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
