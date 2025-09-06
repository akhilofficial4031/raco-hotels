import React from "react";
import { Link } from "react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardStats {
  totalHotels: number;
  totalRooms: number;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  pendingBookings: number;
}

interface RecentActivity {
  id: string;
  type: "booking" | "payment" | "hotel" | "user";
  title: string;
  description: string;
  timestamp: string;
  status?: "success" | "pending" | "warning" | "error";
}

interface UpcomingBooking {
  id: string;
  guestName: string;
  hotelName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: "Confirmed" | "Pending";
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  upcomingBookings: UpcomingBooking[];
  monthlyRevenue: MonthlyRevenue[];
}

const mockDashboardData: DashboardData = {
  stats: {
    totalHotels: 12,
    totalRooms: 245,
    totalBookings: 1847,
    totalRevenue: 2845670,
    occupancyRate: 78.5,
    pendingBookings: 23,
  },
  recentActivities: [
    {
      id: "1",
      type: "booking",
      title: "New Booking Received",
      description: "John Doe booked Deluxe Suite at Grand Plaza Hotel",
      timestamp: "2 minutes ago",
      status: "success",
    },
    {
      id: "2",
      type: "payment",
      title: "Payment Processed",
      description: "$450 payment received for booking #1234",
      timestamp: "15 minutes ago",
      status: "success",
    },
    {
      id: "3",
      type: "hotel",
      title: "Hotel Updated",
      description: "Ocean View Resort amenities updated",
      timestamp: "1 hour ago",
      status: "pending",
    },
    {
      id: "4",
      type: "user",
      title: "New Admin User",
      description: "Sarah Johnson added as hotel manager",
      timestamp: "2 hours ago",
      status: "success",
    },
  ],
  upcomingBookings: [
    {
      id: "BK001",
      guestName: "Alice Smith",
      hotelName: "Grand Plaza Hotel",
      roomType: "Executive Suite",
      checkIn: "2024-08-15",
      checkOut: "2024-08-18",
      status: "Confirmed",
    },
    {
      id: "BK002",
      guestName: "Michael Brown",
      hotelName: "Ocean View Resort",
      roomType: "Standard Room",
      checkIn: "2024-08-16",
      checkOut: "2024-08-20",
      status: "Pending",
    },
    {
      id: "BK003",
      guestName: "Emma Wilson",
      hotelName: "City Center Lodge",
      roomType: "Deluxe Room",
      checkIn: "2024-08-17",
      checkOut: "2024-08-19",
      status: "Confirmed",
    },
  ],
  monthlyRevenue: [
    { month: "Jan", revenue: 210000 },
    { month: "Feb", revenue: 250000 },
    { month: "Mar", revenue: 230000 },
    { month: "Apr", revenue: 280000 },
    { month: "May", revenue: 320000 },
    { month: "Jun", revenue: 350000 },
    { month: "Jul", revenue: 390000 },
  ],
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: "up" | "down";
}> = ({ title, value, icon, trend, trendDirection }) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between transition-transform transform hover:scale-105">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      {trend && (
        <p
          className={`text-sm mt-2 flex items-center ${
            trendDirection === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trendDirection === "up" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l.293.293a1 1 0 001.414-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-7.293l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 10.586V7a1 1 0 11-2 0v3.586l-.293-.293a1 1 0 01-1.414-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {trend}
        </p>
      )}
    </div>
    <div className="text-blue-500 bg-blue-100 p-4 rounded-full">{icon}</div>
  </div>
);

const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const getStatusClasses = (status?: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "warning":
        return "bg-orange-100 text-orange-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "booking":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case "payment":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        );
      case "hotel":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6"
            />
          </svg>
        );
      case "user":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      default:
        return "📋";
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="text-gray-400">{getTypeIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{activity.title}</p>
        <p className="text-sm text-gray-500 truncate">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
      </div>
      {activity.status && (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(
            activity.status,
          )}`}
        >
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
        </span>
      )}
    </div>
  );
};

const RevenueChart: React.FC<{ data: MonthlyRevenue[] }> = ({ data }) => {
  const formatYAxis = (tickItem: number) => {
    return `$${(tickItem / 1000).toFixed(0)}k`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Monthly Revenue
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={formatYAxis}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(value)
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { stats, recentActivities, upcomingBookings, monthlyRevenue } =
    mockDashboardData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const icons = {
    totalHotels: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6"
        />
      </svg>
    ),
    totalRooms: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    totalBookings: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    totalRevenue: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"
        />
      </svg>
    ),
    occupancyRate: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-1.44-1.632M17 20v-2c0-1.657-1.343-3-3-3s-3 1.343-3 3v2m6 0H9"
        />
      </svg>
    ),
    pendingBookings: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back! Here's what's happening with your hotels today.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Hotels"
            value={stats.totalHotels}
            icon={icons.totalHotels}
            trend="+2 this month"
            trendDirection="up"
          />
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            icon={icons.totalRooms}
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            icon={icons.totalBookings}
            trend="+12% vs last month"
            trendDirection="up"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={icons.totalRevenue}
            trend="+8.5% vs last month"
            trendDirection="up"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${stats.occupancyRate}%`}
            icon={icons.occupancyRate}
            trend="+3.2% vs last week"
            trendDirection="up"
          />
          <StatCard
            title="Pending Bookings"
            value={stats.pendingBookings}
            icon={icons.pendingBookings}
            trend="Needs attention"
            trendDirection="down"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <RevenueChart data={monthlyRevenue} />
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Upcoming Bookings
              </h2>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">
                      {booking.id}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {booking.guestName}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {booking.hotelName} • {booking.roomType}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(booking.checkIn)} -{" "}
                    {formatDate(booking.checkOut)}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                View All Bookings →
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Activities
              </h2>
            </div>
            <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                View All Activities →
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Add Hotel", href: "/hotels/new" },
                { label: "Add Room", href: "/rooms/new" },
                { label: "Create Promo", href: "/promo-codes/new" },
                { label: "Add User", href: "/users/new" },
                { label: "Users List", href: "/users" },
                { label: "Settings", href: "/settings" },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-400 transition-all no-underline text-gray-700 font-medium"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
