import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router";

import FullScreenSpinner from "@shared/components/FullScreenSpinner";
import { AuthProvider } from "@shared/contexts/AuthContext";
import { AuthLayout, UnAuthLayout } from "@shared/layouts";

// Lazy load page components with chunked loading for better performance
// Core pages - loaded immediately
const Dashboard = lazy(() => import("./features/dashboard/pages/Dashboard"));
const Login = lazy(() => import("./features/authentication/pages/Login"));
const NotFound = lazy(() => import("@shared/pages/Not-found"));

// Authentication pages - grouped together
const ForgotPassword = lazy(
  () => import("./features/authentication/pages/ForgotPassword"),
);
const SetPassword = lazy(
  () => import("./features/authentication/pages/SetPasswotd"),
);

// User management
const Users = lazy(() => import("./features/users/pages/Users"));

// Hotel & Room management - related features grouped
const Hotels = lazy(() => import("./features/hotels/pages/Hotels"));
const Attractions = lazy(
  () => import("./features/attractions/pages/Attractions"),
);
const RoomType = lazy(() => import("./features/room-type/pages/RoomType"));
const Rooms = lazy(() => import("./features/rooms/pages/Rooms"));
const AddRoomPage = lazy(() => import("./features/rooms/pages/AddRoomPage"));

// Property features & amenities
const Features = lazy(() => import("./features/feature/pages/Features"));
const Amenities = lazy(() => import("./features/amenities/pages/Amenities"));
const Addons = lazy(() => import("./features/addon/pages/Addons"));
const AddonConfiguration = lazy(
  () => import("./features/addon/pages/AddonConfiguration"),
);

// Booking management - grouped for better caching
const Bookings = lazy(() => import("./features/bookings/pages/Bookings"));
const NewBookings = lazy(() => import("./features/bookings/pages/NewBookings"));
const ViewBooking = lazy(() => import("./features/bookings/pages/ViewBooking"));
const EditBooking = lazy(() => import("./features/bookings/pages/EditBooking"));

// Customer management
const CustomerPage = lazy(() => import("./features/customer/pages/Customer"));
const CustomerDetails = lazy(
  () => import("./features/customer/pages/CustomerDetails"),
);
const EditCustomer = lazy(
  () => import("./features/customer/pages/EditCustomer"),
);

// Business operations - reviews, payments, promo codes
const Reviews = lazy(() => import("./features/reviews/pages/Reviews"));
const Payment = lazy(() => import("./features/payments/pages/Payment"));
const PromoCode = lazy(() => import("./features/promo-code/pages/PromoCode"));

// Content Management System
const CmsPage = lazy(() => import("./features/cms/pages/cms-page"));

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

// Root component that provides auth context
const RootLayout = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
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
            path: "addons",
            Component: withSuspense(Addons),
            handle: {
              crumb: () => ({
                label: "Addons",
                href: "/addons",
              }),
            },
          },
          {
            path: "addons/configuration/:id",
            Component: withSuspense(AddonConfiguration),
            handle: {
              crumb: () => ({
                label: "Addon Configuration",
                href: "/addons",
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
            path: "attractions",
            handle: {
              crumb: () => ({
                label: "Attractions",
                href: "/attractions",
              }),
            },
            children: [
              {
                index: true,
                Component: withSuspense(Attractions),
              },
              {
                path: "add",
                Component: withSuspense(Attractions),
                handle: {
                  crumb: () => ({
                    label: "Add Attraction",
                    href: "/attractions/add",
                  }),
                },
              },
              {
                path: "edit/:id",
                Component: withSuspense(Attractions),
                handle: {
                  crumb: () => ({
                    label: "Edit Attraction",
                    href: "/attractions",
                  }),
                },
              },
            ],
          },
          {
            path: "reviews",
            Component: withSuspense(Reviews),
            handle: {
              crumb: () => ({
                label: "Reviews",
                href: "/reviews",
              }),
            },
          },
          {
            path: "payments",
            Component: withSuspense(Payment),
            handle: {
              crumb: () => ({
                label: "Payment",
                href: "/payments",
              }),
            },
          },
          {
            path: "promo-codes",
            Component: withSuspense(PromoCode),
            handle: {
              crumb: () => ({
                label: "Promo Codes",
                href: "/promo-codes",
              }),
            },
          },
          {
            path: "customers",
            handle: {
              crumb: () => ({
                label: "Customers",
                href: "/customers",
              }),
            },
            children: [
              {
                index: true,
                Component: withSuspense(CustomerPage),
              },
              {
                path: ":id",
                Component: withSuspense(CustomerDetails), // TODO: Replace with CustomerView component when created
                handle: {
                  crumb: () => ({
                    label: "Customer Details",
                    href: "/customers", // This will be dynamic based on customer
                  }),
                },
              },
              {
                path: ":id/edit",
                Component: withSuspense(EditCustomer),
                handle: {
                  crumb: () => ({
                    label: "Edit Customer",
                    href: "/customers",
                  }),
                },
              },
            ],
          },
          {
            path: "bookings",
            handle: {
              crumb: () => ({
                label: "Bookings",
                href: "/bookings",
              }),
            },
            children: [
              {
                index: true,
                Component: withSuspense(Bookings),
              },
              {
                path: "new",
                Component: withSuspense(NewBookings),
                handle: {
                  crumb: () => ({
                    label: "New Booking",
                    href: "/bookings/new",
                  }),
                },
              },
              {
                path: ":id",
                Component: withSuspense(ViewBooking),
                handle: {
                  crumb: () => ({
                    label: "View Booking",
                    href: "/bookings", // This will be dynamic
                  }),
                },
              },
              {
                path: ":id/edit",
                Component: withSuspense(EditBooking),
                handle: {
                  crumb: () => ({
                    label: "Edit Booking",
                    href: "/bookings", // This will be dynamic
                  }),
                },
              },
            ],
          },
          {
            path: "promo-codes",
            Component: withSuspense(PromoCode),
            handle: {
              crumb: () => ({
                label: "Promo Codes",
                href: "/promo-codes",
              }),
            },
          },
          {
            path: "cms",
            handle: {
              crumb: () => ({
                label: "Content Management",
                href: "/cms",
              }),
            },
            children: [
              {
                index: true,
                element: <Navigate to="/cms/homepage" replace />,
              },
              {
                path: "homepage",
                Component: withSuspense(CmsPage),
                handle: {
                  crumb: () => ({
                    label: "Homepage Content",
                    href: "/cms/homepage",
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
          {
            path: "/forgot-password",
            Component: withSuspense(ForgotPassword),
          },
          {
            path: "/set-password/:token",
            Component: withSuspense(SetPassword),
          },
        ],
      },
    ],
  },
]);

export default router;
