import React from "react";
import { Link } from "react-router";

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

interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  upcomingBookings: Array<{
    id: string;
    guestName: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    status: string;
  }>;
}

// Mock data - in real app, this would come from API
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
      checkIn: "2024-01-15",
      checkOut: "2024-01-18",
      status: "Confirmed",
    },
    {
      id: "BK002",
      guestName: "Michael Brown",
      hotelName: "Ocean View Resort",
      roomType: "Standard Room",
      checkIn: "2024-01-16",
      checkOut: "2024-01-20",
      status: "Pending",
    },
    {
      id: "BK003",
      guestName: "Emma Wilson",
      hotelName: "City Center Lodge",
      roomType: "Deluxe Room",
      checkIn: "2024-01-17",
      checkOut: "2024-01-19",
      status: "Confirmed",
    },
  ],
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendDirection?: "up" | "down";
}> = ({ title, value, icon, trend, trendDirection }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p
            className={`text-sm mt-1 ${
              trendDirection === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend}
          </p>
        )}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const getStatusColor = (status?: string) => {
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
        return "📅";
      case "payment":
        return "💳";
      case "hotel":
        return "🏨";
      case "user":
        return "👤";
      default:
        return "📋";
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="text-xl">{getTypeIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-sm text-gray-500">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
      </div>
      {activity.status && (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            activity.status,
          )}`}
        >
          {activity.status}
        </span>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { stats, recentActivities, upcomingBookings } = mockDashboardData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your hotels today.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Hotels"
          value={stats.totalHotels}
          icon="🏨"
          trend="+2 this month"
          trendDirection="up"
        />
        <StatCard title="Total Rooms" value={stats.totalRooms} icon="🏠" />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon="📅"
          trend="+12% vs last month"
          trendDirection="up"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          trend="+8.5% vs last month"
          trendDirection="up"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          icon="📊"
          trend="+3.2% vs last week"
          trendDirection="up"
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          icon="⏳"
          trend="Needs attention"
          trendDirection="down"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activities
              </h2>
            </div>
            <div className="p-3 space-y-1 max-h-96 overflow-y-auto">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            <div className="px-6 py-3 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all activities →
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Bookings
              </h2>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      {booking.id}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">
                    {booking.guestName}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {booking.hotelName} • {booking.roomType}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(booking.checkIn)} -{" "}
                    {formatDate(booking.checkOut)}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all bookings →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: "Add Hotel", icon: "🏨", href: "/hotels/new" },
            { label: "Add Room", icon: "🏠", href: "/rooms/new" },
            {
              label: "Create Promo",
              icon: "🎟️",
              href: "/promo-codes/new",
            },
            { label: "Add User", icon: "👤", href: "/users/new" },
            {
              label: "Users List",
              icon: "👥",
              href: "/users",
            },
            {
              label: "Settings",
              icon: "⚙️",
              href: "/settings",
            },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:shadow-sm hover:border-blue-300 transition-all no-underline"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
