import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import App from "./App";
import { AuthLayout, UnAuthLayout } from "./shared/layouts";
import { Login } from "./pages";

const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthLayout,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        Component: App,
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
