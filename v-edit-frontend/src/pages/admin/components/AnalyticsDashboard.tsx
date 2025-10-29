import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface DailyRevenue {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  totalDiscount: number;
}

interface CategoryStat {
  category: string;
  totalRevenue: number;
  totalItems: number;
}

interface TopItem {
  title: string;
  type: string;
  totalSales: number;
  totalRevenue: number;
}

interface Summary {
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
  totalDiscount: number;
  last30Days: {
    revenue: number;
    orders: number;
    newUsers: number;
  };
  changes: {
    revenueChange: number;
    ordersChange: number;
    usersChange: number;
  };
  topItems: TopItem[];
}

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
];

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<number>(30);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Fetch summary
      const summaryResponse = await axios.get(
        `${API_URL}/api/admin/analytics/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSummary(summaryResponse.data.summary);

      // Fetch daily revenue
      const params: any = { days: dateRange };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const dailyResponse = await axios.get(
        `${API_URL}/api/admin/analytics/daily-revenue`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      );
      setDailyRevenue(dailyResponse.data.dailyRevenue);

      // Fetch category stats
      const categoryResponse = await axios.get(
        `${API_URL}/api/admin/analytics/by-category`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: startDate && endDate ? { startDate, endDate } : {},
        },
      );
      setCategoryStats(categoryResponse.data.categoryStats);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      template: "Video Templates",
      folder: "Template Bundles",
      "picture-template": "Pictures",
      "picture-folder": "Picture Bundles",
      "video-content": "Videos",
      "video-folder": "Video Bundles",
      "audio-content": "Audio",
      "audio-folder": "Audio Bundles",
    };
    return labels[category] || category;
  };

  const handleApplyDateFilter = () => {
    fetchAnalytics();
  };

  const exportAnalytics = () => {
    const csvData = dailyRevenue.map((day) => ({
      Date: formatDate(day.date),
      Revenue: day.totalRevenue,
      Orders: day.totalOrders,
      Discount: day.totalDiscount,
    }));

    const headers = ["Date", "Revenue", "Orders", "Discount"];
    const rows = csvData.map((row) => [
      row.Date,
      row.Revenue,
      row.Orders,
      row.Discount,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 mr-3 text-indigo-600" />
            Analytics Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Sales analytics and revenue insights
          </p>
        </div>
        <Button
          onClick={exportAnalytics}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Total Revenue
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-xs sm:text-sm">
            {summary.changes.revenueChange >= 0 ? (
              <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span
              className={
                summary.changes.revenueChange >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {Math.abs(summary.changes.revenueChange).toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Total Orders
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {summary.totalOrders}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-xs sm:text-sm">
            {summary.changes.ordersChange >= 0 ? (
              <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span
              className={
                summary.changes.ordersChange >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {Math.abs(summary.changes.ordersChange).toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Total Users
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {summary.totalUsers}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center text-xs sm:text-sm">
            <span className="text-green-600 font-medium">
              +{summary.last30Days.newUsers}
            </span>
            <span className="text-gray-500 ml-1">new this month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Avg. Order Value
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(
                  summary.totalRevenue / Math.max(summary.totalOrders, 1),
                )}
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center text-xs sm:text-sm">
            <span className="text-gray-500">
              Total discount: {formatCurrency(summary.totalDiscount)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              Date Range:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={dateRange === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(7)}
            >
              7 Days
            </Button>
            <Button
              variant={dateRange === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(30)}
            >
              30 Days
            </Button>
            <Button
              variant={dateRange === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(90)}
            >
              90 Days
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            />
            <Button size="sm" onClick={handleApplyDateFilter}>
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Revenue Trend
        </h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#6366f1"
                strokeWidth={2}
                name="Revenue"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Orders
        </h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip labelFormatter={(label) => formatDate(label)} />
              <Legend />
              <Bar dataKey="totalOrders" fill="#3b82f6" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue by Category
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats as any}
                  dataKey="totalRevenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) =>
                    getCategoryLabel(entry.category as string)
                  }
                >
                  {categoryStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryStats.map((cat, index) => (
              <div
                key={cat.category}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-700">
                    {getCategoryLabel(cat.category)}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(cat.totalRevenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Selling Items
          </h3>
          <div className="space-y-4">
            {summary.topItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-indigo-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getCategoryLabel(item.type)}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.totalSales} sales
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
