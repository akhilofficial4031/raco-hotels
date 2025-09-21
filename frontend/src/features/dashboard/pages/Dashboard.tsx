import {
  BankOutlined,
  ShopOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";
import React, { useMemo } from "react";
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
import useSWR from "swr";

import { APP_LOCALE, LOCALE_DATE_OPTIONS_LONG } from "@shared/constants/app";
import { fetcher } from "@utils/swrFetcher";

import {
  type DashboardStatsResponse,
  type YearlyBookingsResponse,
} from "../services/dashboardService";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between transition-transform transform hover:scale-105">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
    <div className="text-blue-500 bg-blue-100 p-4 rounded-full">{icon}</div>
  </div>
);

const BookingsChart: React.FC<{ data: any[] }> = ({ data }) => {
  const formatYAxis = (tickItem: number) => {
    return String(tickItem);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Yearly Bookings
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
          <Tooltip formatter={(value: number) => [value, "Bookings"]} />
          <Legend />
          <Line
            type="monotone"
            dataKey="bookings"
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
  const { data: statsData } = useSWR<DashboardStatsResponse>(
    "/dashboard/stats",
    fetcher,
  );
  const { data: yearlyBookingsData } = useSWR<YearlyBookingsResponse>(
    "/dashboard/yearly-bookings",
    fetcher,
  );

  const yearlyBookingsChartData = useMemo(() => {
    if (!yearlyBookingsData?.data) return [];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return yearlyBookingsData.data.map((count, index) => ({
      month: months[index],
      bookings: count,
    }));
  }, [yearlyBookingsData]);

  return (
    <div className="bg-transparent min-h-screen p-2">
      <div className=" mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString(
              APP_LOCALE,
              LOCALE_DATE_OPTIONS_LONG,
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Hotels"
            value={statsData?.data?.totalHotels ?? 0}
            icon={<BankOutlined style={{ fontSize: 32 }} />}
          />
          <StatCard
            title="Total Rooms"
            value={statsData?.data?.totalRooms ?? 0}
            icon={<ShopOutlined style={{ fontSize: 32 }} />}
          />
          <StatCard
            title="Total Bookings"
            value={statsData?.data?.totalBookings ?? 0}
            icon={<CarryOutOutlined style={{ fontSize: 32 }} />}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 mt-8">
          <div>
            <BookingsChart data={yearlyBookingsChartData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
